<script setup>
	definePageMeta({
		middleware: ['auth'],
	})
	import { useAlertStore } from '~/stores/alertStore'
	const alert = useAlertStore()
	const { onSubmitAdd } = useSubmit()

	//
	// payments form action
	//
	const onSubmit = async function (form_state) {
		await onSubmitAdd('payments', form_state)
		navigateTo(`/admin/payments`)
	}
</script>

<template>
	<div>
		<Head>
			<Title>Add payment</Title>
		</Head>

		<div class="topsectioncenter">
			<div class="topsectionitem">
				<admin-header title="Add payment" />
			</div>
			<payments-form @submitted="onSubmit" />
		</div>
	</div>
</template>
