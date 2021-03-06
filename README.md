# ytdvr

![ytdvr](/screenshots/ytdvr.png?raw=true)

## Docker

```sh
docker build --tag ytdvr:latest .
docker run \
    -e YT_API_KEY=<api_key> \
    -e YT_PLAYLIST_ID=<playlist_id> \
    -e CRON_SCHEDULE="0 */12 * * *"
    -v $(pwd)/save:/app/save
    -v $(pwd)/data:/app/data
    -p 8080:8000
    --name ytdvr
    ytdvr
```


## Development

```sh
# .env
OUTPUT_PATH=../save/
DATA_PATH=../data/
YT_API_KEY=<api_key>
YT_PLAYLIST_ID=<playlist_id>
YT_PLAYLIST_MAX_COUNT=5
YT_OUTPUT_TEMPLATE=%(channel)s - %(title)s.%(ext)s
ALLOWED_ORIGINS=http://localhost:3000
STATIC_FILES_PATH=../frontend/dist
```

```sh
cd backend/
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

```sh
cd frontend/
npm install

API_BASE_URL=http://localhost:8000 npm run dev

npm run generate
```
