const db = require("../database/db");

function display(req, res) {
    people = [];
    likes = [];
    db.connection.query('select * from users ', (req, rows) => {
        rows.forEach(row => {
            db.connection.query('select * from profile where userID = ?', `${row.userID}`, (req2, rows2) => {
                rows2.forEach(row2 => {
                    if (`${rows2.gaming}` == 1) {
                        likes.push('gaming')
                    }
                    if (`${rows2.music}` == 1) {
                        likes.push('music')
                    }
                    if (`${rows2.netflix}` == 1) {
                        likes.push('netflix')
                    }
                    db.connection.query('select * from images where userID = ?', `${row.userID}`, (req2, rows3) => {
                        rows3.forEach(row3 => {
                            people.push({
                                image: `${row3.filepath}` + '.jpg',
                                fullname: `${row.fullname}`,
                                popularity: `${row2.popularity}`,
                                age: `${row2.age}`,
                                likes: likes
                            })
                        })
                    })
                })

            });
        })
        res.render('match', { people: people });
    })
}

module.exports = {
    display: display
}