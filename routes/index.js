var express = require('express');
var jwt = require('express-jwt');
var router = express.Router();
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var passport = require('passport');

var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

var SC = require('node-soundcloud');
// Initialize client 
SC.init({
  id: 'd2608224bcfc62f56f072dea63df4bdf',
  secret: 'ea4cd243f5780ff679b203179e477b93',
  uri: 'http://www.millsblog.com'
});

router.post('/register', function(req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: 'Please provide a username & password'});
  }

  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);

  user.save(function(err) {
    if (err) { return next(err); }
    return res.json( { token: user.generateJWT() } );
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

router.get('/posts', function(req, res, next) {
	
	Post.find(function(err, posts) {
		if (err) {
			return next(err);
		}

		res.json(posts);
	})
});

router.post('/posts', auth, function(req, res, next) {
	var post = new Post(req.body);
	post.author = req.payload.username;

	var postLink = post.link;
	
	var baseReqString = '/resolve/?url=';

	var combinedReqString =  baseReqString + postLink;

	SC.get(combinedReqString, function(err, result) {

		var resTrackUrl = result['location'];

		var trackId = resTrackUrl.match("tracks/(.*).json");

		var soundcloudBaseUrl = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/';

		var soundcloudUrlWithTrack = soundcloudBaseUrl + trackId[1];
		var soundcloudUrl = soundcloudUrlWithTrack;

		console.log(trackId[1]);

		console.log(soundcloudUrl);

		post.trackId = trackId[1];
		//post.trackUrl = soundcloudUrl;

		post.trackUrl = decodeURIComponent(soundcloudUrl);

		post.save(function(err, posts) {
		
		if (err) {
			 return next(err);
		}

		res.json(post);
		
		})
	
	});
	
	// post.save(function(err, posts) {
	// 	if (err) {
	// 		 return next(err);
	// 	}

	// 	res.json(post);
	// })

});

router.param('post', function(req, res, next, id) {
 	var query = Post.findById(id);

	query.exec(function (err, post) {
		if (err) {
			return next(err);
		}

		if (!post) {
			return next (new Error("can't find post"));
		}

		req.post = post;
		return next();
	})

});

router.param('comment', function(req, res, next, id) {
	var query = Comment.findById(id);

	query.exec(function (err, post) {
		if (err) {
			return next(err);
		}

		if (!comment) {
			return next (new Error("can't find comment"));
		}

		req.comment = comment;
		return next();
	})

});

router.get('/posts/:post', function(req, res, next) {
  req.post.populate('comments', function(err, post) {
    res.json(post);
  });
});

router.put('/posts/:post/upvote',auth, function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});

router.put('/posts/:post/comments/:comment/upvote',auth, function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});

router.post('/posts/:post/comments', auth, function(req, res, exports) {
	var comment = new Comment(req.body);
	comment.post = req.post;
	comment.author = req.payload.username;

	comment.save(function (err, comment) {
		
		if (err) { return next(err) };

		req.post.comments.push(comment);
		req.post.save(function(err, post) {

			if (err) { return next(err) };
			res.json(comment);

		});
	});
});

module.exports = router;
