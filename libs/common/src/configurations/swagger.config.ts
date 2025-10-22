import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class SwaggerConfig {
    static config(app: INestApplication<any>) {
        const config = new DocumentBuilder()
            .setTitle('NestJS Chat App API')
            .setDescription('NestJS Chat App API')
            .setVersion('1.0')
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'Authorization',
                    in: 'header',
                    description: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YzA5YjM5Yi00YzJlLTQxOGUtOGI3Mi1lNzhjOTI4ZDY2ZjQiLCJpYXQiOjE3NjExMDI1NzIsImV4cCI6MTc5MjYzODU3Mn0._qA9Kx5K680WK4bv7Lp0Nu3IrzwBbPDf1W-idZYhodo'
                },
                'jwt-auth'
            )
            .build();

        const document = SwaggerModule.createDocument(app, config);

        SwaggerModule.setup('api', app, document);

        app.use('/api-json', (req, res) => {
            res.json(document)
        })
        
    }
}