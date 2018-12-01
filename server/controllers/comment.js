const DB = require('../utils/db.js')

module.exports = {
  add: async ctx => {
    let user = ctx.state.$wxInfo.userinfo.openId
    let username = ctx.state.$wxInfo.userinfo.nickName.replace(/\\/g, '\\\\')
    let avatar = ctx.state.$wxInfo.userinfo.avatarUrl

    let movieId = +ctx.request.body.movieId
    let content = ctx.request.body.content || null
    let audio = ctx.request.body.audio || null
    let duration = +ctx.request.body.duration || 0

    if (!isNaN(movieId)) {
      await DB.query('INSERT INTO comment(user, username, avatar, content, audio, duration, movie_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [user, username, avatar, content, audio, duration, movieId])
    }

    ctx.state.data = {}
  },
  
  list: async ctx => {
    let movieId = +ctx.request.query.movieId

    if (!isNaN(movieId)) {
      ctx.state.data = await DB.query('SELECT * FROM comment WHERE comment.movie_id = ? ORDER BY create_time DESC', [movieId])
    } else {
      ctx.state.data = []
    }
  },

  recommend: async ctx => {
    // 获取非用户本人的且未收藏的电影
    let user = ctx.state.$wxInfo.userinfo.openId
    ctx.state.data = (await DB.query("SELECT comment.id AS commentId, comment.movie_id AS movieId, comment.username AS userName, comment.avatar AS avatar, movie.title AS movieTitle, movie.image AS movieImage, rand() AS tag FROM comment LEFT JOIN movie ON comment.movie_id = movie.id WHERE comment.user <> ? AND comment.id NOT IN (SELECT favourite.comment_id FROM favourite WHERE favourite.user = ?) ORDER BY tag DESC LIMIT 1", [user, user]))[0] || null
  },

  user: async ctx => {
    let user = ctx.state.$wxInfo.userinfo.openId
    let {movieId} = ctx.request.query
    if (!movieId) {
      movieId = null
    } 
    // 获取非用户本人的影评
    ctx.state.data = (await DB.query("SELECT comment.id AS commentId, comment.content AS content, comment.audio AS audio, comment.duration AS duration, movie.image AS movieImage, movie.title AS movieTitle FROM comment LEFT JOIN movie ON comment.movie_id = movie.id WHERE comment.user = ? AND comment.movie_id = IFNULL(?, comment.movie_id)", [user, movieId]))
  },

  detail: async ctx => {
    let user = ctx.state.$wxInfo.userinfo.openId
    let id = +ctx.params.id

    if (!isNaN(id)) {
      ctx.state.data = (await DB.query('SELECT comment.id AS commentId, comment.movie_id AS movieId, comment.user AS user, comment.username AS userName, comment.avatar AS avatar, comment.content AS content, comment.audio AS audio, comment.duration AS duration, comment.create_time AS createTime, movie.title AS movieTitle, movie.image AS movieImage, favourite.id AS favId FROM comment LEFT JOIN movie ON comment.movie_id = movie.id LEFT JOIN favourite on comment.id = favourite.comment_id and favourite.user = ? WHERE comment.id = ?', [user, id]))[0] || null
    }
  }
}