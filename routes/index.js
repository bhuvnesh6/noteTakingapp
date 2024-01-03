var express = require('express');
var router = express.Router();
let data = require('./notes');
let user = require('./users');
let passport = require('passport')
let localStrategy = require('passport-local');
const { render } = require('ejs');

passport.use(new localStrategy(user.authenticate()));
/* GET home page. */




router.get('/signup', function(req, res) {
  res.render('signup');
});

router.get('/auth', function(req, res) {
  res.render('auth');
});

router.post('/createuser', async function(req, res){
  try{
  let userData = await new user({
    name:req.body.name,
    username:req.body.username,
    date: new Date,
    secret: req.body.sec
  });

  user.register(userData, req.body.password)
  .then(function(registerdUser){
    passport.authenticate("local")(req,res, function(){
      res.render('home')
    })
  })

} catch (error) {
  console.error(error);
  res.status(500).send('Internal Server Error');
}
})

router.post('/loggin', passport.authenticate("local", {
  successRedirect: "/",
  failureFlash: "/auth",
}),(req,res)=>{}
)

function auth(req,res,next){
  if(req.isAuthenticated()){
    return next()
  } else{
    res.render('auth')
  }
}
router.get('/', auth, function(req, res) {
  res.render('home');
});

router.get('/home', auth, async function(req, res, next) {
  try {
    let UserD = await user.findOne({username: req.session.passport.user})
    .populate("note");
    res.render('index', { UserD });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/addNotes', auth, async function(req, res) {
  try {
    if (!req.body.title || !req.body.para) {
      return res.status(400).send('Title and content are required.');
    }

    let data1 = new data({
      title: req.body.title,
      content: req.body.para,
      user: req.body.userID,
      date: new Date(),
    });
    await data1.save();
    let uId = req.body.userID
    let unotes = await user.findOne({_id: uId});
    unotes.note.push(data1._id)
     unotes.save();

    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/ndata/:ndataID', auth, async function(req, res) {
  try {
    let ndataID = req.params.ndataID;
    let notes = await data.findOne({ _id: ndataID });

    if (!notes) {
      return res.status(404).send('Note not found.');
    }

    res.render('note', { notes });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/editNote', auth, async function(req, res) {
  try {
    let noteId = req.body.noteId;

    let edited = await data.updateOne(
      { _id: noteId },
      {
        $set: {
          title: req.body.title,
          content: req.body.para,
          date: new Date(),
        },
      }
    );

    if (edited.nModified === 0) {
      return res.status(404).send('Note not found.');
    }

    res.redirect(`/ndata/${noteId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/delete/:notID', auth, async function(req, res) {
  try {
    let notID = req.params.notID;

    let deletedNote = await data.findOneAndDelete({ _id: notID });

    if (!deletedNote) {
      return res.status(404).send('Note not found.');
    }

    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/search', auth, async function(req, res){
   let searchterm = req.body.search
  try{
    let userID = req.session.passport.user;
    let userD = await user.findOne({username: userID})
    const escapedSearchTerm = searchterm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let DATA = await data.find({title:{
    $regex: new RegExp(escapedSearchTerm, 'i')
    }, 
      user: userD._id
  })
    res.render('search', {DATA})
  }catch(err){
    console.log(err)
    res.status(500).send('internal server error')
  }
  
})


module.exports = router;
