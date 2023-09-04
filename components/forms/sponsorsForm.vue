<template>
	<div>
		<FormKit
			type="form"
			:config="{ validationVisibility: 'live' }"
			v-model="state"
			submit-label="Submit"
			@submit="submitForm(state)"
		>
			<FormKit
				label="Sponsor Name"
				name="ad_client_name"
				type="text"
				validation="required"
			/>

			<FormKit
				label="Sponsor contact"
				name="ad_client_contact"
				type="text"
				validation="required"
			/>

			<FormKit
				label="Sponsor email"
				name="ad_client_email"
				type="email"
				validation="required | email"
			/>

			<FormKit
				label="Sponsor phone"
				name="ad_client_phone"
				placeholder="xxx-xxx-xxxx"
				validation=" required | matches:/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/"
				type="tel"
				:validation-messages="{
					matches: 'Phone number must be in the format xxx-xxx-xxxx',
				}"
			/>

			<FormKit
				label="Website"
				name="ad_client_website"
				type="text"
				validation="required"
			/>

			<!-- ad image file upload 			-->
			<p>Image must be 750w 125h 72dpi</p>
			<label for="ad_image">Add or Replace Advert image file</label><br />

			<!-- <Toast /> -->

			<FileUpload
				mode="basic"
				name="fileInput"
				:auto="true"
				accept="image/*"
				customUpload
				@uploader="customUploader"
			/>
			<br />
			<br />
			<!-- show image file  -->
			<div
				v-if="state.ad_image_path"
				class="card flex justify-content-start mb-2"
			>
				<label
					>Current image filepath is<br />
					{{ state.ad_image_path }}</label
				>
				<Image :src="state.ad_image_path" alt="Image" width="320" />
			</div>
		</FormKit>

		<p v-if="saving" class="text-2xl"><ProgressSpinner /> Saving ...</p>
		<Button label="Cancel" @click="cancelForm()"> </Button>

		<!-- Modal -->
		<Dialog
			v-model:visible="displayModal"
			:breakpoints="{ '960px': '75vw', '640px': '90vw' }"
			:style="{ width: '50vw' }"
		>
			<template #header>
				<div class="my-dialog-header">
					<h3>Processing file</h3>
				</div></template
			>
			<ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
		</Dialog>
	</div>
	<!-- </div> -->
</template>

<script setup>
	import { useAuthStore } from '~/stores/authStore'
	// import { useToast } from 'primevue/usetoast'
	// const toast = useToast()

	const auth = useAuthStore()
	const saving = ref(false)
	const fileInput = ref(null)
	const image = ref('')
	//
	// Outgoing
	//
	const emit = defineEmits(['submitted'])
	//
	// Incoming
	//
	const props = defineProps({
		id: { Number, default: 0 },
	})

	//
	// Initialize form
	//
	let state = ref({})

	//
	// edit if there is an id - add if not
	//
	if (props.id !== 0) {
		// get opponent with id === props.id
		const { data, pending, error, refresh } = await useFetch(
			`/sponsors/${props.id}`,
			{
				key: props.id,
				method: 'get',
				headers: {
					authorization: auth.user.token,
				},
			}
		)
		state.value = data.value
	}

	//
	// progress modal
	//
	const displayModal = ref(false)
	const openProgressModal = () => {
		displayModal.value = true
	}
	const closeProgressModal = () => {
		displayModal.value = false
	}

	const customUploader = async (event) => {
		const file = event.files[0]
		// const photoUrl = URL.createObjectURL(file)

		// voodoo
		const image = new Image()
		const imageDimensions = await new Promise((resolve) => {
			image.src = URL.createObjectURL(file)
			image.onload = () => {
				const dimensions = {
					height: image.height,
					width: image.width,
				}
				resolve(dimensions)
			}
		})

		if (imageDimensions.height === 125 && imageDimensions.width === 750) {
			const formData = new FormData()
			formData.append('file', file)
			openProgressModal()
			// Find server code in folder Nuxt3-brc-media-api
			const res = await fetch(`https://media.buffalorugby.org/images/upload`, {
				method: 'POST',
				body: formData,
				headers: {
					authorization: auth.user.token,
				},
			})

			const data = await res.json()
			closeProgressModal()
			image.value = data.imageUrl
			// console.log('IN handle image.value = ', image.value)
			state.value.ad_image_path = data.imageUrl
		} else {
			alert(
				'Illegal dimensons ' +
					imageDimensions.height +
					' ' +
					imageDimensions.width +
					'Image must be 125h 750w'
			)
		}
	}

	//
	// form handlers
	//
	const submitForm = (state) => {
		saving.value = true
		emit('submitted', state)
	}

	const cancelForm = () => {
		navigateTo('/admin/sponsors')
	}
</script>