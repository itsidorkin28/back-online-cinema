import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { MovieModel } from './movie.model'
import { UpdateMovieDto } from './dto/update-movie.dto'
import { Types } from 'mongoose'

@Injectable()
export class MovieService {
	constructor(@InjectModel(MovieModel) private readonly MovieModel: ModelType<MovieModel>) {
	}

	async getAll(searchTerm?: string) {
		let options = {}
		if (searchTerm) {
			options = {
				$or: [
					{
						title: new RegExp(searchTerm, 'i'),
					},
				],
			}
		}

		return this.MovieModel
			.find(options)
			.select('-updatedAt -__v')
			.sort({
				createdAt: 'desc',
			})
			.populate('actors genres')
			.exec()
	}

	async byActor(actorId: Types.ObjectId) {
		const docs = await this.MovieModel.findOne({ actors: actorId }).exec()
		if (!docs) throw new NotFoundException('Movies not found!')
		return docs
	}

	async byGenres(genreIds: Types.ObjectId[]) {
		const doc = await this.MovieModel.find({
			genres: { $in: genreIds },
		}).exec()
		if (!doc) throw new NotFoundException('Movies not found!')
		return doc
	}

	async bySlug(slug: string) {
		const doc = await this.MovieModel.findOne({ slug }).populate('actors genres').exec()
		if (!doc) throw new NotFoundException('Movies not found!')
		return doc
	}

	async updateCountOpened(slug: string) {
		const updateDoc = await this.MovieModel
			.findOneAndUpdate({ slug },
				{
					$inc: { countOpened: 1 },
				},
				{
					new: true,
				})
			.exec()

		if (!updateDoc) {
			return new NotFoundException('Movie not found')
		}

		return updateDoc
	}

	async getMostPopular() {
		return await this.MovieModel
			.find({ countOpened: { $gt: 0 } })
			.sort({ countOpened: -1 })
			.populate('genres')
			.exec()
	}

	async updateRating(id: Types.ObjectId, newRating: number) {
		return this.MovieModel.findByIdAndUpdate(id, {
			rating: newRating,
		}, {
			new: true,
		})
			.exec()
	}

	/* Admin place */

	async byId(_id: string) {
		const doc = await this.MovieModel.findById(_id)
		if (!doc) throw new NotFoundException('Movie not found')
		return doc
	}

	async update(_id: string, dto: UpdateMovieDto) {

		//todo: Telegram notifications
		const updateDoc = await this.MovieModel.findByIdAndUpdate(_id, dto, {
			new: true,
		}).exec()

		if (!updateDoc) {
			return new NotFoundException('Movie not found')
		}

		return updateDoc
	}

	async create() {
		const defaultValue: UpdateMovieDto = {
			bigPoster: '',
			actors: [],
			genres: [],
			poster: '',
			title: '',
			videoUrl: '',
			slug: '',
		}
		const movie = await this.MovieModel.create(defaultValue)
		return movie._id
	}

	async delete(id: string) {
		const deleteDoc = await this.MovieModel.findByIdAndDelete(id)

		if (!deleteDoc) {
			return new NotFoundException('Movie not found')
		}

		return deleteDoc
	}
}
