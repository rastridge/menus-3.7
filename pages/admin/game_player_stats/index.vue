<template>
	<div>
		<Head>
			<Title>Stats Admin</Title>
		</Head>
		<div class="topsectioncenter">
			<div class="topsectionitem">
				<admin-header :title="app" />
			</div>
			<!-- 			<div v-if="!stats" class="topsectionitem">
				<ProgressSpinner /> Loading ...
			</div> -->
			<div>
				<!--Select season -->
				<div class="topsectionitem">
					<select-season
						:startyear="startyear"
						:currentyear="year"
						@submitted="onSubmit"
						class="mb-3"
					/>

					<select-game-type
						:currenttype="gametype"
						@submitted="onSubmitGameType"
					/>
				</div>
			</div>
			<div class="renderlist-enclosure">
				<render-list
					:data="filteredData"
					:page="page"
					:app="app"
					:statusable="statusable"
					:editable="editable"
					:deleteable="deleteable"
					:addable="addable"
					:viewable="viewable"
					@changeStatus="changeStatus"
					@deleteItem="deleteItem"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
	definePageMeta({
		middleware: ['auth'],
	})
	import { usePlacemarkStore } from '@/stores'
	const placemark = usePlacemarkStore()
	const { $dayjs } = useNuxtApp()

	//
	// initialize renderlist
	//
	const { getAccess } = useRenderListAccess()
	const { editable, addable, deleteable, statusable, viewable } = getAccess(app)
	const stats = ref([])

	const app = 'game_player_stats'
	const page = ref(placemark.getPage)

	//
	// Initialize year select
	//
	const startyear = 1966
	const year = ref(placemark.getYear)

	//
	// select Game type
	//
	const gametype = ref(placemark.getGameTypeId)

	const filteredData = computed(() => {
		return stats.value.filter((d) => {
			// console.log(
			// 	'$dayjs.unix(d.date_ut).format(YYYY-MM-DD)',
			// 	$dayjs.unix(d.date_ut).format('YYYY-MM-DD')
			// )
			// console.log('d.date_ut', d.date_ut)
			if (gametype.value === 7) {
				return d.game_type_id === 7
			} else {
				return d.game_type_id !== 7
			}
		})
	})

	// Save current after changes
	watch(gametype, (newgametype) => {
		placemark.setGameTypeId(newgametype)
		placemark.setPage(0)
		page.value = 0
	})

	//
	// get season data
	//
	const getSeason = async () => {
		const url = `/game_player_stats/getseason/${year.value}`
		const { data, error } = await useFetch(url, {
			method: 'get',
		})
		if (error.value) {
			throw createError({
				...error.value,
				statusMessage: `Could not get data from ${url}`,
			})
		} else {
			// date and time from unix time
			data.value.dt = '0000'
			stats.value = data.value
		}
	}

	//
	// set season after drop down choice
	//
	const onSubmit = async function (value) {
		year.value = value
		placemark.setYear(year.value)
		placemark.setPage(0)
		page.value = 0
		await getSeason()
	}
	//
	// set gametype after drop down choice
	//
	const onSubmitGameType = async function (value) {
		gametype.value = value
		placemark.setGameTypeId(gametype.value)
	}

	//
	// get current season on select season submit
	//
	getSeason()

	//
	// Renderlist actions
	//
	const { deleteOne, changeStatusOne } = useFetchAll()

	const deleteItem = async (id) => {
		await deleteOne(app, id)
	}

	const changeStatus = async ({ id, status }) => {
		await changeStatusOne(app, { id, status })
	}
</script>
