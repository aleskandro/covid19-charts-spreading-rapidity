#!/bin/bash
echo "---"
date
#set -ex

IMAGE=aleskandro/covid19-spreading-charts
REPO=/root/covid19-charts-spreading-rapidity
GREENPORT=8800
BLUEPORT=8801
EXPOSEDPORT=8888
iptables -L | grep $EXPOSEDPORT >/dev/null 2>&1
CHECK=$?

if [ $CHECK -ne 0 ]; then
        echo -e "\e[91mMain input rule does not exists. Creating...\e[39m"
        iptables -A INPUT -p tcp --dport $EXPOSEDPORT -j ACCEPT
fi

function bgdeploy {
        echo -e "\e[101mRolling deployment: $4 --> $3\e[49m"
        docker stop $3 > /dev/null
        docker rm $3   > /dev/null
        docker run -p $1:80 -d --name $3 aleskandro/covid19-spreading-charts
        while true; do
                if [ $(curl -LI http://localhost:$1 -o /dev/null -w '%{http_code}\n' -s) == "200" ]; then
                        break
                fi
                sleep 1
        done
        echo "Removing old redirect"
        R=0
        while [ $R -eq 0 ]; do
                iptables -t nat -D PREROUTING -p tcp --dport $EXPOSEDPORT -j REDIRECT --to-ports $2 || R=1
        done
        echo "Adding new redirect"
        iptables -t nat -A PREROUTING -p tcp --dport $EXPOSEDPORT -j REDIRECT --to-ports $1
        docker stop $4 > /dev/null
}

echo -e "\e[34mChecking for new image on Dockerhub...\e[39m"
docker pull $IMAGE | grep "Image is up to date" && pull_status="already_pulled" || pull_status="newly_pulled"

if [ "$pull_status" = "newly_pulled" ]; then
        echo -e "\e[95mDeploying\e[39m"
        if [ -f "/tmp/green" ]; then
                rm -rf /tmp/green
                touch /tmp/blue
                bgdeploy $BLUEPORT $GREENPORT blue green
        else
                rm -rf /tmp/blue
                touch /tmp/green
                bgdeploy $GREENPORT $BLUEPORT green blue
        fi
        echo -e "\e[95mDeployment done\e[39m"
        exit 0
fi

echo -e "\e[32mNo new images. Quitting\e[39m"
exit 1

