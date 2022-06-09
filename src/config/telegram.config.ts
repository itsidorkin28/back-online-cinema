import { Telegram } from '../telegram/telegram.interface'

export const getTelegramConfig = (): Telegram => ({
	chatId: '398795650',
	token: process.env.TELEGRAM_BOT_TOKEN,
})
