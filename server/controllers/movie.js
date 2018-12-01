const DB = require('../utils/db.js')

module.exports = {
  list: async ctx => {
    ctx.state.data = await DB.query('SELECT * FROM movie')
  },
  
  detail: async ctx => {
    let movieId = +ctx.params.id

    if (!isNaN(movieId)) {
      movie = (await DB.query('SELECT * FROM movie WHERE id = ?', [movieId]))[0]
    } else {
      movie = {}
    }
  
    ctx.state.data = movie
  }
}