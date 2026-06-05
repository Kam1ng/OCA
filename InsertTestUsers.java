import java.sql.*;

public class InsertTestUsers {
    public static void main(String[] args) {
        String url = "jdbc:mysql://127.0.0.1:3306/mysql?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true";
        String user = "root";
        String password = "";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connected to MySQL successfully!");

            String createUser = "CREATE USER IF NOT EXISTS 'eldercare'@'localhost' IDENTIFIED BY 'eldercare123'";
            String grant = "GRANT ALL PRIVILEGES ON elder_care.* TO 'eldercare'@'localhost'";
            String flush = "FLUSH PRIVILEGES";

            try (Statement stmt = conn.createStatement()) {
                stmt.executeUpdate(createUser);
                System.out.println("User created: eldercare");
            }

            try (Statement stmt = conn.createStatement()) {
                stmt.executeUpdate(grant);
                System.out.println("Privileges granted");
            }

            try (Statement stmt = conn.createStatement()) {
                stmt.executeUpdate(flush);
                System.out.println("Privileges flushed");
            }

            String insertGuardian = "INSERT INTO elder_care.users (username, password, phone, nickname, deleted) VALUES ('guardian', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '13800138001', 'Guardian Zhang', 0)";
            String insertElderly = "INSERT INTO elder_care.users (username, password, phone, nickname, deleted) VALUES ('elderly', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '13900139001', 'Elderly Li', 0)";

            try (Statement stmt = conn.createStatement()) {
                try {
                    stmt.executeUpdate(insertGuardian);
                    System.out.println("Guardian user inserted");
                } catch (SQLException e) {
                    if (e.getMessage().contains("Duplicate")) {
                        System.out.println("Guardian user already exists");
                    } else {
                        throw e;
                    }
                }
            }

            try (Statement stmt = conn.createStatement()) {
                try {
                    stmt.executeUpdate(insertElderly);
                    System.out.println("Elderly user inserted");
                } catch (SQLException e) {
                    if (e.getMessage().contains("Duplicate")) {
                        System.out.println("Elderly user already exists");
                    } else {
                        throw e;
                    }
                }
            }

            System.out.println("All done!");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}