Twitter = function( user ){
  user = (user) ? user : Meteor.users.findOne({_id: this.userId})
  if( !user.services || !user.services.twitter ){
    throw new Meteor.Error('Twitter services are not available on this user.')
    return
  }

  var Twit = Npm.require('twit'),
    Future = Npm.require('fibers/future'),
    fs = Npm.require('fs'),
    self = this

  this.config = _.extend({user: {
      access_token: user.services.twitter.accessToken,
      access_token_secret: user.services.twitter.accessTokenSecret
  }}, ServiceConfiguration.configurstions.findOne({service: 'twitter'}))

  this.service = new Twit({
    consumer_key: this.config.consumerKey,
    consumer_secret: this.config.secret,
    access_token: this.config.user.access_token,
    access_token_secret: this.config.user.access_token_secret
  })

  return {
    verify: function(){
      var future = new Future()

      self.service.get('account/verify_credentials', {include_email:true}, function(err, data, response){
        future.return({
          err: err,
          data: data
        })
      })

      return future.wait()
    },

    upload: function( filepath ){
      var future = new Future(),
        encoded_data = fs.readFileSync(filepath, {encoding: 'base64'})

      self.service.post('media/upload', {media_data: encoded_data}, function(err, data, response){
        future.return({
          err: err,
          data: data,
          response: response
        })
      })

      return future.wait()
    },

    post: function( opts ){
      var future = new Future(),
      // check to see if this post has media that we need to upload first
        media_data = (opts.post.media) ? opts.post.media.filepath : '',
        upload_response,
      // translate the "content" key to "status"
      // to work with the twitter api
        post = _.pick(_.translate(opts.post, {content: 'status'}), 'status')
      if( media_data && (media_data.length > 0) ){
        upload_response = this.upload(media_data)
        // make sure we check the response and act appropriately
        if( upload_response.err ){
          return upload_response
        }

        post.media_ids = upload_response.data.media_id_string
      }

      // attempt to post an update to twitter
      self.service.post('statuses/update', post, function(err, data, response){
        future.return({
          err: err,
          data: data,
          response: response
        })
      })

      return future.wait()
    },

    stats: function( tweetIds ){
      var future = new Future(),
        opts = {
          id: (tweetIds.constructor == Array) ? tweetIds.join(',') : tweetIds
        }

      self.service.get('statuses/lookup', opts, function(err, data, response){
        future.return({
          err: err,
          data: data,
          response: response
        })
      })

      return future.wait()
    },

    tweets: function( opts ){
      var future = new Future()

      _.defaults(opts,{
        q: 'social marketing',
        count: 10,
        result_type: 'popular',
        lang: 'en'
      })

      self.service.get('search/tweets', opts, function(err, data, response){
        future.return({
          err: err,
          data: data,
          response: response
        })
      })

      return future.wait()
    }
  }
}