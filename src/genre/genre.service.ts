import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { GenreModel } from './genre.model'
import { CreateGenreDto } from './dto/create-genre.dto'

@Injectable()
export class GenreService {
	constructor(@InjectModel(GenreModel) private readonly GenreModel: ModelType<GenreModel>) {
	}

	async bySlug(slug: string) {
		return this.GenreModel.findOne({ slug }).exec()
	}

	async getAll(searchTerm?: string) {
		let options = {}
		if (searchTerm) {
			options = {
				$or: [
					{
						name: new RegExp(searchTerm, 'i'),
					},
					{
						slug: new RegExp(searchTerm, 'i'),
					},
					{
						description: new RegExp(searchTerm, 'i'),
					},
				],
			}
		}
		return this.GenreModel
			.find(options)
			.select('-updatedAt -__v')
			.sort({
				createdAt: 'desc',
			})
			.exec()
	}


	async getCollections() {
		const genres = await this.getAll()
		const collections = genres
		//todo: must be written
		return collections
	}

	/* Admin place */

	async byId(_id: string) {
		const genre = await this.GenreModel.findById(_id)
		if (!genre) throw new NotFoundException('Genre not found')
		return genre
	}

	async update(_id: string, dto: CreateGenreDto) {
		const updateDoc = await this.GenreModel.findByIdAndUpdate(_id, dto, {
			new: true,
		}).exec()

		if (!updateDoc) {
			return new NotFoundException('Genre not found')
		}

		return updateDoc
	}

	async create() {
		const defaultValue: CreateGenreDto = {
			name: '',
			slug: '',
			description: '',
			icon: '',
		}
		const genre = await this.GenreModel.create(defaultValue)
		return genre._id
	}

	async delete(id: string) {
		const deleteDoc = await this.GenreModel.findByIdAndDelete(id)

		if (!deleteDoc) {
			return new NotFoundException('Genre not found')
		}

		return deleteDoc
	}
}
