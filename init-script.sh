npx @nestjs/cli new kn-network --package-manager npm
npx @nestjs/cli generate app user
npx @nestjs/cli generate app file
npx @nestjs/cli generate app chat

nest g module users
nest g service users --no-spec
nest g controller users --no-spec

nest g module roles
nest g service roles --no-spec
nest g controller roles --no-spec

nest g module permissions
nest g service permissions --no-spec
nest g controller permissions --no-spec

nest g module auth
nest g service auth --no-spec
nest g controller auth --no-spec

