const Author = require('../models/author')
const Book = require('../models/book')
const { body, validationResult } = require('express-validator/check')
const { sanitizeBody } = require('express-validator/filter')
const async = require('async')

// Display list of all Authors.
exports.author_list = function(req, res, next) {
  Author.find()
    .sort([['family_name', 'ascending']])
    .exec(function(err, list_authors) {
      if (err) {
        return next(err)
      }
      //Successful, so render
      res.render('author_list', {
        title: 'Author List',
        author_list: list_authors
      })
    })
}

// Display detail page for a specific Author.
exports.author_detail = function(req, res, next) {
  async.parallel(
    {
      author: function(callback) {
        Author.findById(req.params.id).exec(callback)
      },
      authors_books: function(callback) {
        Book.find({ author: req.params.id }, 'title summary').exec(callback)
      }
    },
    function(err, results) {
      if (err) {
        return next(err)
      } // Error in API usage.
      if (results.author == null) {
        // No results.
        const err = new Error('Author not found')
        err.status = 404
        return next(err)
      }
      // Successful, so render.
      res.render('author_detail', {
        title: 'Author Detail',
        author: results.author,
        author_books: results.authors_books
      })
    }
  )
}

// Показать форму создания автора по запросу GET.
exports.author_create_get = function(req, res, next) {
  res.render('author_form', { title: 'Create Author' })
}

// Создать автора по запросу POST.
exports.author_create_post = [
  // Validate fields.
  body('first_name')
    .isLength({ min: 1 })
    .trim()
    .withMessage('First name must be specified.')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .isLength({ min: 1 })
    .trim()
    .withMessage('Family name must be specified.')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters.'),
  body('date_of_birth', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601(),
  body('date_of_death', 'Invalid date of death')
    .optional({ checkFalsy: true })
    .isISO8601(),

  // Sanitize fields.
  sanitizeBody('first_name').escape(),
  sanitizeBody('family_name').escape(),
  sanitizeBody('date_of_birth').toDate(),
  sanitizeBody('date_of_death').toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('author_form', {
        title: 'Create Author',
        author: req.body,
        errors: errors.array()
      })
      return
    } else {
      // Data from form is valid.

      // Create an Author object with escaped and trimmed data.
      const author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
      })
      author.save(function(err) {
        if (err) {
          return next(err)
        }
        // Successful - redirect to new author record.
        res.redirect(author.url)
      })
    }
  }
]

// Показать форму удаления автора по запросу GET.
exports.author_delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author delete GET')
}

// Удалить автора по запросу POST.
exports.author_delete_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author delete POST')
}

// Показать форму обновления автора по запросу GET.
exports.author_update_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author update GET')
}

// Обновить автора по запросу POST.
exports.author_update_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author update POST')
}
