<template>
	<div>
		<div class="editor m-1">
			<ClientOnly>
				<quill-editor
					contentType="html"
					v-model:content="localfield"
					toolbar="full"
					:modules="modules"
					@textChange="changeState()"
				></quill-editor>
			</ClientOnly>
		</div>

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
</template>

<script setup>
	import { QuillEditor } from '@vueup/vue-quill'
	import ImageUploader from 'quill-image-uploader'
	import { useAuthStore } from '~/stores/authStore'
	const auth = useAuthStore()
	/* 	const {
		CLOUD_NAME,
		CLOUD_API_KEY,
		CLOUD_API_SECRET,
		CLOUD_UPLOAD_PRESET,
		CLOUD_API,
		MY_MEDIA_API,
	} = useRuntimeConfig() */
	//
	// Incoming
	//
	const props = defineProps({
		field: { type: String, required: true },
		app: { type: String, required: true },
	})
	const localfield = ref(props.field)

	//
	// outgoing
	//
	const emit = defineEmits(['changeState'])

	const changeState = () => {
		emit('changeState', localfield)
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
	//
	// quill modules
	//
	const modules = {
		module: ImageUploader,
		options: {
			upload: async (file) => {
				const formData = new FormData()
				formData.append('file', file)
				openProgressModal()
				// Find server code in folder Nuxt3-brc-media-api
				const url = `https://media.buffalorugby.org/images/${props.app}`
				const res = await fetch(url, {
					method: 'POST',
					body: formData,
					headers: {
						authorization: auth.user.token,
					},
				})

				const data = await res.json()
				closeProgressModal()
				return data.imageUrl
			},
		},
	}

	// const fileinfo = ref('')

	// const getFiles = async () => {
	// 	const res = await fetch('https://media.my-test-site.net/files', {
	// 		method: 'GET',
	// 		headers: {
	// 			authorization: auth.user.token,
	// 			Accept: '*/*',
	// 		},
	// 	})
	// 	// 		if (res.ok) {
	// 	// 	fileinfo.value = await res.json()
	// 	// }
	// 	fileinfo.value = await res.json()
	// }
</script>
