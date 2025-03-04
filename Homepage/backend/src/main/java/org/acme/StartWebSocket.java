package org.acme;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;
import java.util.List;
import java.util.ArrayList;


@ServerEndpoint("/start-websocket/{name}/{gameId}") // Game ID als Pfadparameter
@ApplicationScoped
public class StartWebSocket {
    private static final Logger LOGGER = Logger.getLogger(StartWebSocket.class.getName());
    private final Map<String, Session> sessions = new ConcurrentHashMap<>();
    private final Map<String, Player> players = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();
    private final Map<String, GameSession> gameSessions = new ConcurrentHashMap<>(); // Map für Game Sessions


    @OnOpen
    public void onOpen(Session session, @PathParam("name") String name, @PathParam("gameId") String gameId) { // Game ID Parameter hinzugefügt
        if (sessions.containsKey(name)) {
            try {
                session.close(new CloseReason(CloseReason.CloseCodes.CANNOT_ACCEPT, "Name already taken"));
            } catch (IOException e) {
                LOGGER.severe("Fehler beim Schließen der Session: " + e.getMessage());
            }
            return;
        }

        sessions.put(name, session);
        Player newPlayer = new Player(name, 32, 76);
        players.put(name, newPlayer);

        GameSession gameSession = gameSessions.computeIfAbsent(gameId, id -> { // GameSessionManager verwenden
            double seed = random.nextDouble(); // Level Seed pro Game ID
            return new GameSession(id, seed);
        });
        gameSession.addPlayer(name); // Spieler zur Game Session hinzufügen


        broadcastPlayerPositions(gameSession); // Spielerliste AN ALLE IN DER GAME SESSION senden
        sendPlayerPositionsToNewPlayer(session, gameSession); // Sendet Positionsdaten an neuen Spieler
        sendLevelSeedToNewPlayer(session, gameSession.getLevelSeed()); // Sendet Level Seed an neuen Spieler

        LOGGER.info("Spieler " + name + " ist GameID " + gameId + " beigetreten. Seed: " + gameSession.getLevelSeed());
    }

    @OnClose
    public void onClose(@PathParam("name") String name, @PathParam("gameId") String gameId) { // Game ID Parameter hinzugefügt
        sessions.remove(name);
        players.remove(name);
        GameSession gameSession = gameSessions.get(gameId);
        if (gameSession != null) {
            gameSession.removePlayer(name);
            broadcastPlayerPositions(gameSession); // Spielerliste an verbleibende Spieler der Game Session senden
        }

        LOGGER.info("Spieler " + name + " hat GameID " + gameId + " verlassen.");
    }

    @OnError
    public void onError(@PathParam("name") String name, @PathParam("gameId") String gameId, Throwable throwable) { // Game ID Parameter hinzugefügt
        LOGGER.severe("Fehler bei " + name + " in GameID " + gameId + ": " + throwable.getMessage());
        sessions.remove(name);
        players.remove(name);
        GameSession gameSession = gameSessions.get(gameId);
        if (gameSession != null) {
            gameSession.removePlayer(name);
            broadcastPlayerPositions(gameSession); // Spielerliste an verbleibende Spieler der Game Session senden
        }
        LOGGER.info("Spieler " + name + " (GameID "+gameId+")  verlassen (Error).");
    }

    @OnMessage
    public void onMessage(String message, @PathParam("name") String name, @PathParam("gameId") String gameId, Session session) { // Game ID Parameter hinzugefügt
        try {
            JsonMessage jsonMessage = objectMapper.readValue(message, JsonMessage.class);
            GameSession gameSession = gameSessions.get(gameId);
            if (gameSession == null) {
                LOGGER.warning("GameSession nicht gefunden für GameID: " + gameId);
                return;
            }

            switch (jsonMessage.type) {
                case "position":
                    handlePositionUpdate(name, jsonMessage.x, jsonMessage.y, gameSession);
                    break;
                case "levelSeed": // Fall für LevelSeed Nachrichten
                    broadcastLevelSeedToGameSession(gameSession, jsonMessage.seed); // Broadcast an alle in der Game Session
                    break;
                default:
                    LOGGER.warning("Unbekannter Nachrichtentyp von " + name + "(GameID "+gameId+"): " + jsonMessage.type);
            }
        } catch (IOException e) {
            LOGGER.severe("Fehler beim Verarbeiten der Nachricht von " + name + "(GameID "+gameId+"): " + e.getMessage());
        }
    }

    private void handlePositionUpdate(String name, double x, double y, GameSession gameSession) {
        Player player = players.get(name);
        if (player != null) {
            player.x = x;
            player.y = y;
            broadcastPlayerPositions(gameSession); // Broadcast innerhalb der Game Session
        }
    }


    private void broadcastPlayerPositions(GameSession gameSession) {
        try {
            List<Player> gamePlayers = gameSession.getPlayers().stream()
                    .map(players::get)
                    .filter(p -> p != null)
                    .toList();

            Map<String, Object> positionsMessage = new HashMap<>(); // HashMap für das JSON-Objekt erstellen
            positionsMessage.put("type", "playerPositions"); // Typ setzen
            positionsMessage.put("players", gamePlayers); // Spielerliste hinzufügen

            String playerListJson = objectMapper.writeValueAsString(positionsMessage); // HashMap als JSON serialisieren

            for (String playerName : gameSession.getPlayerNames()) {
                Session session = sessions.get(playerName);
                if (session != null && session.isOpen()) {
                    session.getAsyncRemote().sendText(playerListJson);
                }
            }
        } catch (IOException e) {
            LOGGER.severe("Fehler beim Senden der Spielerliste für GameID "+ gameSession.getGameId() +": " + e.getMessage());
        }
    }


    private void sendPlayerPositionsToNewPlayer(Session session, GameSession gameSession) {
        try {
            List<Player> gamePlayers = gameSession.getPlayers().stream()
                    .map(players::get)
                    .filter(p -> p != null)
                    .toList();

            Map<String, Object> positionsMessage = new HashMap<>(); // HashMap für das JSON-Objekt erstellen
            positionsMessage.put("type", "playerPositions"); // Typ setzen
            positionsMessage.put("players", gamePlayers); // Spielerliste hinzufügen

            String playerListJson = objectMapper.writeValueAsString(positionsMessage); // HashMap als JSON serialisieren
            if (session.isOpen()) {
                session.getAsyncRemote().sendText(playerListJson);
            }
        } catch (IOException e) {
            LOGGER.severe("Fehler beim Senden der Spielerliste an neuen Spieler für GameID "+ gameSession.getGameId() +": " + e.getMessage());
        }
    }

    private void sendLevelSeedToNewPlayer(Session session, double levelSeed) {
        try {
            Map<String, Object> levelSeedMessage = new HashMap<>();
            levelSeedMessage.put("type", "levelSeed");
            levelSeedMessage.put("seed", levelSeed);
            String levelSeedJson = objectMapper.writeValueAsString(levelSeedMessage);
            if (session.isOpen()) {
                session.getAsyncRemote().sendText(levelSeedJson);
            }
        } catch (IOException e) {
            LOGGER.severe("Fehler beim Senden des Level Seeds an neuen Spieler: " + e.getMessage());
        }
    }
    private void broadcastLevelSeedToGameSession(GameSession gameSession, double seed) {
        try {
            Map<String, Object> levelSeedMessage = new HashMap<>();
            levelSeedMessage.put("type", "levelSeed");
            levelSeedMessage.put("seed", seed);
            String levelSeedJson = objectMapper.writeValueAsString(levelSeedMessage);
            for (String playerName : gameSession.getPlayerNames()) {
                Session session = sessions.get(playerName);
                if (session != null && session.isOpen()) {
                    session.getAsyncRemote().sendText(levelSeedJson);
                }
            }
        } catch (IOException e) {
            LOGGER.severe("Fehler beim Broadcasten des Level Seeds für GameID "+ gameSession.getGameId() +": " + e.getMessage());
        }
    }


    private static class Player {
        public String name;
        public double x;
        public double y;

        public Player(String name, double x, double y) {
            this.name = name;
            this.x = x;
            this.y = y;
        }
        public Player() { } //Default Konstruktor für Jackson
        // Getter und Setter für Jackson (wichtig für die Serialisierung)
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getX() { return x; }
        public void setX(double x) { this.x = x; }
        public double getY() { return y; }
        public void setY(double y) { this.y = y; }
    }

    private static class GameSession { // GameSession Klasse
        private String gameId;
        private double levelSeed;
        private List<String> playerNames;

        public GameSession(String gameId, double levelSeed) {
            this.gameId = gameId;
            this.levelSeed = levelSeed;
            this.playerNames = new ArrayList<>();
        }

        public String getGameId() { return gameId; }
        public double getLevelSeed() { return levelSeed; }
        public List<String> getPlayerNames() { return playerNames; }
        public void addPlayer(String playerName) { this.playerNames.add(playerName); }
        public void removePlayer(String playerName) { this.playerNames.remove(playerName); }
        public void setLevelSeed(double levelSeed) { this.levelSeed = levelSeed; }
        public List<String> getPlayers() { // Gibt Spielernamen zurück
            return playerNames;
        }
    }


    //Hilfsklasse für JSON Nachrichten
    public static class JsonMessage {
        public String type;
        public String direction; // Für Bewegungsrichtung
        public double x; // Für X-Position
        public double y; // Für Y-Position
        public double seed; // Für Level Seed


        //Default Konstruktor für Jackson
        public JsonMessage() { }

        //Getter und Setter für Jackson
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getDirection() { return direction; }
        public void setDirection(String direction) { this.direction = direction; }
        public double getX() { return x; }
        public void setX(double x) { this.x = x; }
        public double getY() { return y; }
        public void setY(double y) { this.y = y; }
        public double getSeed() { return seed; }
        public void setSeed(double seed) { this.seed = seed; }
    }
}