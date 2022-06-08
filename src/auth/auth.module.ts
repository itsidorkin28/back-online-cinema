import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { TypegooseModule } from 'nestjs-typegoose'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UserModel } from '../user/user.model'
import { JwtModule } from '@nestjs/jwt'
import { getJwtConfig } from '../config/jwt.config'
import { jwtStrategy } from './strategies/jwt.strategy'

@Module({
	providers: [AuthService, jwtStrategy],
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: UserModel,
				schemaOptions: {
					collection: 'User',
				},
			},
		]),
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig,
		}),
	],
	controllers: [AuthController],
})
export class AuthModule {
}
