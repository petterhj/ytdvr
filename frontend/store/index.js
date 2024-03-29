import Vue from 'vue'

export const state = () => ({
  state: null,
  videos: {},
  connected: false,
})

export const mutations = {
  SET_STATE(state, data) {
    state.state = data
  },
  SET_VIDEOS(state, data) {
    if (data.clear_current) {
      console.log("Clearing current video items")
      state.videos = {}
    }
    for (let video of data.videos) {
      Vue.set(state.videos, video.video_id, video)
    }
    console.log(`Received ${Object.keys(state.videos).length} video items`)
  },
  CLEAR_JOB(state, video_id) {
    if (video_id in state.videos) {
      Vue.set(state.videos[video_id], 'job', null)
      return
    }
    console.error(`Unknown video id for clear: ${video_id}`)
  },
  SOCKET_CONNECT(state) {
    console.log('Connected to socket!')
    state.connected = true
  },
  SOCKET_DISCONNECT(state) {
    console.warn('Disconnected form socket!')
    state.connected = false
  },
  SOCKET_PROGRESS_UPDATE(state, data) {
    if (data.video_id in state.videos) {
      if (data.job) {
        Vue.set(state.videos[data.video_id], 'job', data.job)
        if (data.job.failed_at) {
          this.app.$toast.error(`Job failed: "${state.videos[data.video_id].title}"`)
        }
      }
      if (data.progress) {
        console.debug(
          data.progress.processor, ' | ',
          data.progress.status, ' | ',
          data.progress.downloaded_bytes, ' / ',
          data.progress.total_bytes, ' | ',
          data.progress.percent,
        )
        Vue.set(state.videos[data.video_id], 'progress', data.progress)
      }
      return
    }
    console.error(`Unknown video id for update: ${data.video_id}`)
  }
}

export const actions = {
  async getState({ commit }) {
    console.log("Fetching state")

    await this.$axios.get('/state')
      .then((response) => {
        commit('SET_STATE', response.data)
      }, (error) => {
        console.error(error);
        this.app.$toast.error(`${error.config.method.toUpperCase()} ${error.config.url}: ${error.message}`)
      })
  },
  async getPlaylistVideos({ commit }) {
    console.log("Fetching playlist videos")

    await this.$axios.get('/videos')
      .then((response) => {
        commit('SET_VIDEOS', {
          'videos': response.data,
          'clear_current': true,
        })
      }, (error) => {
        console.error(error);
        this.app.$toast.error(`${error.config.method.toUpperCase()} ${error.config.url}: ${error.message}`)
      })
  },
  async processVideos({ commit }) {
    console.log("Processing videos")

    await this.$axios.get('/videos/process')
      .then((response) => {
        if (response.data.length > 0) {
          console.log(`Started processing of ${response.data.length} videos`)
          commit('SET_VIDEOS', {
            'videos': response.data,
            'clear_current': false,
          })
        } else {
          console.log("Nothing to do!")
          this.app.$toast.info('No new videos to process', {
            duration: 3000
          })
        }
      }, (error) => {
        console.error(error);
        this.app.$toast.error(`${error.config.method.toUpperCase()} ${error.config.url}: ${error.message}`)
      })
  },
  async clearJob({ commit }, video_id) {
    console.log(`Clearing job for vide ${video_id}`)

    await this.$axios.get(`/videos/${video_id}/job/clear`)
      .then((response) => {
        console.log(response.data.detail)
        commit('CLEAR_JOB', video_id)
      }, (error) => {
        console.error(error);
        this.app.$toast.error(`${error.config.method.toUpperCase()} ${error.config.url}: ${error.message}`)
      })
  }
}

export const getters = {
  state: state => state.state,
  videos: state => state.videos,
  isConnected: state => state.connected,
}
