ng build --configuration=development --aot
rsync -cavvz --progress --delete dist/frontend/* tecneplas:/root/tecneplas/devapp/frontend/dist