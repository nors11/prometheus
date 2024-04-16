npm run build
rsync -cavvz --progress --delete node_modules/* tecneplas:/root/tecneplas/devapp/backend/node_modules
rsync -cavvz --progress --delete dist/* tecneplas:/root/tecneplas/devapp/backend/dist
