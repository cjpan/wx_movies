const DB = require('../utils/db.js')

module.exports = {
  update: async ctx => {
    let user = ctx.state.$wxInfo.userinfo.openId
    let commentId = +ctx.request.body.commentId
    let action = ctx.request.body.action
    console.log(ctx)

    if (!isNaN(commentId)) {
      if (action === 'unstar') {
        await DB.query('DELETE FROM favourite WHERE user = ? and comment_id = ?', [user, commentId])
      } else if (action === 'star') {
        await DB.query('INSERT INTO favourite (user, comment_id) VALUES (?, ?)', [user, commentId])
      }
    }

    ctx.state.data = {}
  },

  list: async ctx => {
    let user = ctx.state.$wxInfo.userinfo.openId;
    ctx.state.data = await DB.query('SELECT comment_movie.commentId, comment_movie.movieImage, comment_movie.movieTitle, comment_movie.username, comment_movie.avatar, comment_movie.content, comment_movie.audio, comment_movie.duration FROM favourite LEFT JOIN (SELECT comment.id as commentId, movie.image as movieImage, movie.title as movieTitle, comment.username as username, comment.avatar as avatar, comment.content as content, comment.audio as audio, comment.duration as duration FROM comment LEFT JOIN movie ON comment.movie_id = movie.id) AS comment_movie ON favourite.comment_id = comment_movie.commentId WHERE favourite.user = ?', [user])
  }
}