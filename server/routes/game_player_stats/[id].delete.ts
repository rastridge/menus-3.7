import { statsService } from '~/server/services/statsService'

export default defineEventHandler(async (event) => {
	if (okProtectedEndpoint(event)) {
		const id = event.context.params.id
		return statsService.deleteOne(id)
	} else {
		return 'restricted'
	}
})
