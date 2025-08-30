import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

public class ChatServer {
    private static final int PORT = 8080;
    private final AtomicInteger idCounter = new AtomicInteger(0);
    private volatile Integer waitingClient = null;
    private final Map<Integer, Integer> partners = new ConcurrentHashMap<>();
    private final Map<Integer, LinkedBlockingQueue<String>> messages = new ConcurrentHashMap<>();

    public static void main(String[] args) throws IOException {
        new ChatServer().start();
    }

    private void start() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/join", new JoinHandler());
        server.createContext("/partner", new PartnerHandler());
        server.createContext("/send", new SendHandler());
        server.createContext("/receive", new ReceiveHandler());
        server.createContext("/", new StaticHandler());
        server.setExecutor(null);
        System.out.println("Server started on port " + PORT);
        server.start();
    }

    private class JoinHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }
            int clientId = idCounter.incrementAndGet();
            String response;
            synchronized (ChatServer.this) {
                if (waitingClient == null) {
                    waitingClient = clientId;
                    response = "{\"clientId\":" + clientId + ",\"status\":\"waiting\"}";
                } else {
                    int partnerId = waitingClient;
                    waitingClient = null;
                    partners.put(clientId, partnerId);
                    partners.put(partnerId, clientId);
                    messages.putIfAbsent(clientId, new LinkedBlockingQueue<>());
                    messages.putIfAbsent(partnerId, new LinkedBlockingQueue<>());
                    response = "{\"clientId\":" + clientId + ",\"partnerId\":" + partnerId + "}";
                }
            }
            byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    private class PartnerHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }
            String query = exchange.getRequestURI().getQuery();
            int clientId = Integer.parseInt(query.replace("clientId=", ""));
            Integer partnerId = partners.get(clientId);
            String response = partnerId == null ? "{\"partnerId\":null}" : "{\"partnerId\":" + partnerId + "}";
            byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    private class SendHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }
            String query = exchange.getRequestURI().getQuery();
            int fromId = Integer.parseInt(query.replace("from=", ""));
            Integer partnerId = partners.get(fromId);
            if (partnerId == null) {
                exchange.sendResponseHeaders(404, -1);
                return;
            }
            InputStream is = exchange.getRequestBody();
            String msg = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            messages.get(partnerId).add(msg);
            exchange.sendResponseHeaders(204, -1);
        }
    }

    private class ReceiveHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }
            String query = exchange.getRequestURI().getQuery();
            int clientId = Integer.parseInt(query.replace("clientId=", ""));
            LinkedBlockingQueue<String> queue = messages.get(clientId);
            StringBuilder sb = new StringBuilder();
            sb.append("[");
            if (queue != null) {
                String msg;
                boolean first = true;
                while ((msg = queue.poll()) != null) {
                    if (!first) sb.append(',');
                    sb.append("\"").append(msg.replace("\"", "\\\"")).append("\"");
                    first = false;
                }
            }
            sb.append("]");
            byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    private class StaticHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }
            String path = exchange.getRequestURI().getPath();
            if ("/".equals(path)) path = "/index.html";
            java.nio.file.Path file = java.nio.file.Path.of("public" + path);
            if (!java.nio.file.Files.exists(file)) {
                exchange.sendResponseHeaders(404, -1);
                return;
            }
            byte[] bytes = java.nio.file.Files.readAllBytes(file);
            String contentType = path.endsWith(".css") ? "text/css" : path.endsWith(".js") ? "application/javascript" : "text/html";
            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }
}
