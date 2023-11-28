import { opponentsService } from '~/server/services/opponentsService'

export default defineEventHandler(async (event) => {
	protectEndpoint(event)
	const body = await readBody(event)
	return opponentsService.editOne(body)
})
