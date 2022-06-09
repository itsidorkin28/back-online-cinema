import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { GenreModel } from './genre.model'
import { CreateGenreDto } from './dto/create-genre.dto'
import { MovieService } from '../movie/movie.service'
import { ICollection } from './genre.interface'

@Injectable()
export class GenreService {
	constructor(
		@InjectModel(GenreModel) private readonly GenreModel: ModelType<GenreModel>,
		private readonly movieService: MovieService) {
	}

	async bySlug(slug: string) {
		const doc = await this.GenreModel.findOne({ slug }).exec()
		if (!doc) throw new NotFoundException('Genre not found!')
		return doc
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
		const collection = await Promise.all(
			genres.map(async (genre) => {
				const movieByGenre = await this.movieService.byGenres([genre._id])
				if (movieByGenre.length === 0) return null

				const result: ICollection = {
					_id: String(genre._id),
					image: movieByGenre[0].bigPoster,
					slug: genre.slug,
					title: genre.name,
				}
				return result
			}),
		)
		return collection.filter((el) => el !== null)
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
