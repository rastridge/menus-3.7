import { paymentsService } from '~/server/services/paymentsService'

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()
	const headers = event.node.req.headers

	const id = event.context.params.id
	return paymentsService.deleteOne(id)
})