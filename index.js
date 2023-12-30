const express = require('express')
const fs = require('fs')
const joi = require('joi')
const path = require('path')
const schema = joi.object({
    name: joi.string().max(20).required(),
    surname: joi.string().max(20).required(),
    city: joi.string().max(20).required(),
    age: joi.number().min(0).required()
})

let users
let uniqId
const saveFile = path.join(__dirname, 'users.json')

function save () {
    const data = {
        savedUsers: users,
        lastId: uniqId
    }
    fs.writeFileSync(saveFile, JSON.stringify(data, null, 4))
}

function load () {
    data = JSON.parse(fs.readFileSync(saveFile, 'utf-8'))
    users = data.savedUsers
    uniqId = data.lastId
}

const app = express()

app.use(express.json())

app.get('/users', (req, res) => {
    load()
    res.send({users})
})

app.post('/users', (req, res) => {
    load()
    const result = schema.validate(req.body)
    if (result.error) {
        return res.status(404).send({error: result.error.details})
    }
    uniqId++
    users.push({id: uniqId, ...req.body})
    res.send({id: uniqId})
    save()
})

app.put('/users/:id', (req, res) => {
    load()
    const result = schema.validate(req.body)
    if (result.error) {
        return res.status(404).send({error: result.error.details})
    }
    const user = users.find(us => us.id === Number(req.params.id))
    if (user) {
        user.name = req.body.name
        user.surname = req.body.surname
        user.city = req.body.city
        user.age = req.body.age
        res.send({ id: user })
    } else {
        res.status(404)
        res.send({ user: null })
    }
    save()
})

app.get('/users/:id', (req, res) => {
    load()
    const user = users.find(us => us.id === Number(req.params.id))
    if (user) {
        res.send({ id: user })
    } else {
        res.status(404)
        res.send({ user: null })
    }
})

app.delete('/users/:id', (req, res) => {
    load()
    const user = users.find(us => us.id === Number(req.params.id))
    if (user) {
        const userIndex = users.indexOf(user)
        users.splice(userIndex, 1)
        res.send({ user })
    } else {
        res.status(404)
        res.send({ user: null })
    }
    save()
})

app.listen(3000)
