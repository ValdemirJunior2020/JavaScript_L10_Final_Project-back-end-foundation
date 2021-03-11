var express = require('express');
var router = express.Router();

const mysql = require('mysql2');
var models = require('../models');
var authService = require('../services/auth');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('index', {Welcome: 'Bethel Tech Coding Forum',
  Title: 'Feel Free To Join By Signing Up.'
 })
});
//Get signup route
router.get('/signup', function (req, res, next) {
  res.render('signup');
});
//Get login route
router.get('/login', function (req, res, next) {
  res.render('login');
});
//Get logout route
router.get('/logout', function (req, res, next) {
  res.cookie('jwt', " ", { expires: new Date(0) });
  res.render('error', {message: 'You have successfully been logged out!'});
});
//Get profile route
router.get('/profile', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user) {
          let status = 'Normal'
          if (user.Admin) {
            status = 'Administrator'
          }
          models.posts.findAll({
            where: {UserId: user.UserId}
          })
          .then(posts => {
            res.render('profile', {
              FirstName: user.FirstName,
              LastName: user.LastName,
              Email: user.Email,
              UserId: user.UserId,
              Username: user.Username,
              accessUser: user.Admin,
              Status: status,
              posts
            });
          })
        } else {
          res.render('error', { message: 'Invalid Token!' });
        }
      })
  } else {
    res.render('error', { message: 'Hey! You are not logged in!' })
  }
});
//Get users list for admin
router.get('/admin/', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user.Admin) {
          models.users.findAll({
            where: { Deleted: false }
          })
            .then(users => {
              res.render('users', { users: users })
            })
        } else {
          res.render('error', { message: 'You are not authorized to view this page!' })
        }
      })
  }else {
    res.render('error', {message: 'You are not logged in!'});
  }
});
//Get single user for admin
router.get('/admin/editUser/:id', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user && user.Admin) {
          models.users
            .findByPk(parseInt(req.params.id))
            .then(foundUser => {
              let status = 'Normal'
              if (foundUser.Admin) {
                status = 'Administrator'
              }
              res.render('user', {
                FirstName: foundUser.FirstName,
                LastName: foundUser.LastName,
                Email: foundUser.Email,
                Username: foundUser.Username,
                UserId: foundUser.UserId,
                Status: status
              });
            });
        } else {
          res.render('error', { message: 'You can not do that!' })
        }
      })
  }
});
//get all of a users posts in the db 
router.get('/posts', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user) { 
          models.users
            .findAll({
              where: { Deleted: false, }, 
              include: {model: models.posts}
            })
            .then(users_posts => {
              if(user.Admin){
                let status = 'Administrator'
             if(user) {
               let status = 'Normal User'
             }
             res.render('userProfile',
             {users_posts, 
              accessUser: user.Admin,
               user,
               status
            })
              }             
            })
        } else {
          res.render('error', { message: 'Whoops! Something went wrong!' })
        }
      })
  }
});
//Get create new post route
router.get('/create', function (req, res, next) {
  res.render('create');
});
//Signup route
router.post('/signup', function (req, res, next) {
  models.users
    .findOrCreate({
      where: {
        Username: req.body.username
      },
      defaults: {
        FirstName: req.body.firstName,
        LastName: req.body.lastName,
        Email: req.body.email,
        Password: authService.hashPassword(req.body.password),
        Admin: false,
        Deleted: false
      }
    })
    .spread(function (result, created) {
      if (created) {
        res.redirect('login');
      } else {
        res.redirect('error', { message: 'This user already exists!' })
      }
    });
});
//login route
router.post('/login', function (req, res, next) {
  models.users
    .findOne({
      where: {
        Username: req.body.username
      }
    })
    .then(user => {
      if (!user) {
        console.log('User not found!')
        return res.redirect('error', { message: 'Login Failed!' });
      } else {
        let passwordMatch = authService.comparePasswords(req.body.password, user.Password);
        if (passwordMatch) {
          let token = authService.signUser(user);
          res.cookie('jwt', token);
          res.redirect('profile');
        } else {
          res.render('error', { message: 'Wrong Password!' })
        }
      }
    });
});
//Create new post
router.post('/create', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user) {
        models.posts
          .findOrCreate({
            where: {
              PostTitle: req.body.PostTitle
            },
            defaults: {
              PostBody: req.body.PostBody,
              UserId: user.UserId,
              Deleted: false
            }
          })
          .spread(function (result, created) {
            if (created) {
              res.redirect('profile');
            } else {
              res.render('error', { message: 'This Post already exists' });
            }
          });
      }
    });
  }
});
//admin delete a user
router.post('/:id', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      let userId = parseInt(req.params.id);
      if(user) {
        models.users
        .update({
          Deleted: true
        },
          {
            where: { UserId: userId }
          })
        .then(function (result) {
          if (result) {
            res.redirect('admin')
          } else {
            res.send('User can not be deleted!')
          }
        });
      }
    })
  }
});
//Route for users to delete a post
router.post('/posts/:id', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      let postId = parseInt(req.params.id);
    if(user){
      models.posts
      .update({
        Deleted: true
      },
        {
          where: {
            PostId: postId
          }
        })
      .then(function (result) {
        if (result) {
          res.redirect('/users/profile')
        } else {
          res.send('Post can not be deleted')
        }
      });
    }
    })
  }
});
//Route for users to edit their posts
router.post('/edit/:id', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      let postId = parseInt(req.params.id);
     if(user) {
      models.posts
      .update({
        PostTitle: req.body.PostTitle,
        PostBody: req.body.PostBody,
        Deleted: false
      },
        {
          where: {
            PostId: postId
          }
        })
      .then(function (result) {
        if (result) {
          res.redirect('/users/profile')
        } else {
          res.send('Post can not be deleted')
        }
      });
     }
    })
  }
});
module.exports = router;
