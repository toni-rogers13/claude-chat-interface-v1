chat interface built with the help of claude
run [docker compose up -d] to start a postgres container (if port 5433 is already taken on your machine, change it in both docker-compose.yml and .env)
run [cp .env.example .env] to copy the template to the .env you will be using with the interface. You also need to go in and add your own claude api key to the file as well
migrate using [npx prisma migrate dev], creates conversation and message tables inside the postgres container

then just run using npm run chat
