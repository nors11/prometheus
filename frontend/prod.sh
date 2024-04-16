npm run build-prod
rsync -cavvz --progress --delete dist/frontend/* tecneplas:/root/tecneplas/app/frontend/dist