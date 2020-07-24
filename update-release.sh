
curl -s -L https://github.com/Roaders/rpi-garage-door/releases/latest -o latestRelease.html

PARTIAL="$(grep -o '\/Roaders\/rpi-garage-door\/releases\/download.*\.tgz' ./latestRelease.html)"
FULL="https://github.com$PARTIAL"

echo "Downloading latest release $PARTIAL"

wget -O latestRelease.tgz $FULL

echo "Stopping garage-door"

sudo systemctl stop garage-door

echo "Extracting tar..."

tar -zxvf latestRelease.tgz --strip-components=1

echo "Rebuilding epoll"

npm rebuild epoll

echo "Cleaning up"

rm ./latestRelease.html ./latestRelease.tgz

echo "Starting garage-door"

sudo systemctl start garage-door