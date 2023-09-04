<template>
	<div id="events">
		<div class="center-content">
			<common-header title="Game Schedule" />
		</div>
		id = {{ id }} year = {{ year }} placemark.getYear {{ placemark.getYear }}
		<!--Select season -->
		<div class="text-center m-5">
			<select-season
				:startyear="startyear"
				:currentyear="year"
				@submitted="onSubmit"
				class="mb-3"
			/>
			<select-game-type :currenttype="gametype" @submitted="onSubmitGameType" />
		</div>

		<!-- <DataView :value="season"> -->
		<DataView
			:value="filteredData"
			paginator
			:rows="5"
			:first="first"
			:pt="{
				rroot: {
					style: {
						padding: '0.5rem',
						minWidth: '10rem',
						border: '2px #00C solid',
						'border-radius': '10px',
					},
				},
			}"
			@page="onPaginate"
		>
			<template #list="slotProps">
				<div class="col-12">
					<div
						class="flex flex-column md:flex-row justify-content-between align-items-center xl:align-items-center gap-2 mb-2 p-2 shadow-4 bg-blue-600 text-white font-semibold"
					>
						<!-- left -->
						<div
							class="flex flex-row justify-content-center md:flex-column align-items-center md:align-items-start gap-3 border-soli w-full md:w-3"
						>
							<div class="flex align-items-center border-soli">
								<span class="lg:text-xl font-bold text-900">
									{{
										$dayjs(slotProps.data.date).format('MMMM D @ h:mm A')
									}}</span
								>
							</div>

							<div class="flex align-items-center border-soli">
								<span class="font-semibold"
									>{{ getGameLevelCode(slotProps.data) }} Side
								</span>
							</div>

							<div class="flex align-items-center border-soli">
								<span class="font-semibold">{{
									slotProps.data.game_type
								}}</span>
							</div>
						</div>

						<!-- center -->

						<div
							class="flex flex-column align-items-center gap-1 border-soli w-full md:w-6"
						>
							<div class="flex align-items-center border-soli">
								<Button
									:label="slotProps.data.title"
									text
									class="text-3xl font-bold"
									@click.prevent="showGame(slotProps.data.game_id)"
								>
								</Button>
							</div>
							<div class="flex align-items-center border-soli">
								<span class="text-2xl font-semibold">
									{{ getResultCode(slotProps.data) }} &nbsp;&nbsp;&nbsp;
									{{ slotProps.data.ptsFor }} -
									{{ slotProps.data.ptsAgn }}</span
								>
							</div>
						</div>

						<!-- right -->
						<div
							class="flex flex-row justify-content-center md:flex-column align-items-center md:align-items-start gap-2 border-soli w-full md:w-3"
						>
							<div class="flex align-items-center gap-3 border-soli">
								<span class="md:text-xl font-semibold"
									>@ {{ slotProps.data.venue }}</span
								>
							</div>
							<div class="flex align-items-center border-soli">
								<span>
									{{ slotProps.data.occasion }}
								</span>
							</div>
							<div class="flex align-items-center border-soli">
								<Button
									label="Show history"
									link
									size="small"
									@click.prevent="showHistory(slotProps.data.opponent_id)"
								>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</template>
		</DataView>
		<roster-chart />
	</div>
</template>

<script setup>
	import { usePlacemarkStore } from '@/stores'
	import dayjs from 'dayjs'
	const { $dayjs } = useNuxtApp()

	const placemark = usePlacemarkStore()
	const { getGameLevelCode, getResultCode } = useGames()

	//
	// Get account id to edit
	//
	const route = useRoute()
	const id = ref(parseInt(route.params.id))
	//
	// Initialize year select
	//
	const startyear = 1966
	const year = ref(0)

	if (id.value === 0) {
		if (placemark.getYear === 0) {
			placemark.initYear()
			year.value = placemark.getYear
		} else {
			year.value = placemark.getYear
		}
	} else {
		placemark.setYear(id.value)
		year.value = placemark.getYear
	}

	//
	// select Game type
	//
	const gametype = ref(placemark.getGameTypeId)

	//
	// Initial settings for pagination
	//
	const first = ref(placemark.getPage)

	const onPaginate = (e) => {
		first.value = e.rows * e.page
		placemark.setPage(first.value)
	}
	//
	// get / set season data
	//
	const season = ref([])

	const getSeason = async (year) => {
		const url = `/game_player_stats/getseason/${year}`
		const { data, error } = await useFetch(url, {
			method: 'get',
			headers: {
				// authorization: auth.user.token,
				authorization: 'not-needed',
			},
		})
		if (error.value) {
			throw createError({
				...error.value,
				statusMessage: `Could not get data from ${url}`,
			})
		}
		// const d = $dayjs(season.value.date)
		// data.value.date = d.format('YYYY')
		return data.value
	}
	season.value = await getSeason(year.value)

	const onSubmit = async (value) => {
		year.value = value
		placemark.setYear(year.value)
		season.value = await getSeason(year.value)
	}

	const onSubmitGameType = (value) => {
		gametype.value = value
		placemark.setGameTypeId(value)
	}

	//
	// set gametype after drop down choice
	//

	const filteredData = computed(() => {
		return season.value.filter((d) => {
			if (gametype.value === 7) {
				return d.game_type_id === 7
			} else {
				return d.game_type_id !== 7
			}
		})
	})

	const showGame = (id) => {
		placemark.setYear(year.value)
		navigateTo(`/games/game/${id}`)
	}
	const showHistory = (id) => {
		placemark.setYear(year.value)
		navigateTo(`/games/history/${id}`)
	}
</script>