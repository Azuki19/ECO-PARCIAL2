// gameHandlers.js

const { assignRoles } = require("../utils/helpers")

// Assuming db and io are required or passed in some way to be accessible
const joinGameHandler = (socket, db, io) => {
  return (user) => {
    db.players.push({ id: socket.id, score: 0, ...user }) // Agrega el score con valor inicial de 0
    io.emit("userJoined", db)
  }
}


const startGameHandler = (socket, db, io) => {
  return () => {
    db.players = assignRoles(db.players)

    db.players.forEach((element) => {
      io.to(element.id).emit("startGame", element.role)
    })
  }
}

const notifyMarcoHandler = (socket, db, io) => {
  return () => {
    const rolesToNotify = db.players.filter(
      (user) => user.role === "polo" || user.role === "polo-especial"
    )

    rolesToNotify.forEach((element) => {
      io.to(element.id).emit("notification", {
        message: "Marco!!!",
        userId: socket.id,
      })
    })
  }
}

const notifyPoloHandler = (socket, db, io) => {
  return () => {
    const rolesToNotify = db.players.filter((user) => user.role === "marco")

    rolesToNotify.forEach((element) => {
      io.to(element.id).emit("notification", {
        message: "Polo!!",
        userId: socket.id,
      })
    })
  }
}

const onSelectPoloHandler = (socket, db, io) => {
  return (userID) => {
    const marco = db.players.find((user) => user.id === socket.id)
    const poloSelected = db.players.find((user) => user.id === userID)

    if (poloSelected.role === "polo-especial") {
      // Marco atrapa al Polo especial -> +50 puntos
      marco.score += 50
      poloSelected.score -= 10 // Polo especial pierde puntos

      // Comprobar si Marco ha ganado
      if (marco.score >= 100) {
        // Navegar a la pantalla de resultados o terminar el juego
        io.emit("notifyGameOver", {
          message: `¡El marco ${marco.nickname} ha ganado con ${marco.score} puntos!`,
          winner: marco.nickname
        })
      } else {
        io.emit("notifyGameOver", {
          message: `El marco ${marco.nickname} ha atrapado al Polo especial ${poloSelected.nickname}`
        })
      }

    } else {
      // Marco no atrapa al Polo especial -> -10 puntos
      marco.score -= 10

      // Notificar a todos
      io.emit("notifyGameOver", {
        message: `El marco ${marco.nickname} ha fallado y su puntuación es ${marco.score}`
      })
    }

    // Actualizar puntos de todos los jugadores
    io.emit("updateScores", db.players)
  }
}


module.exports = {
  joinGameHandler,
  startGameHandler,
  notifyMarcoHandler,
  notifyPoloHandler,
  onSelectPoloHandler,
}