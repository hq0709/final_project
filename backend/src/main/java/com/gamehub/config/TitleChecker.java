package com.gamehub.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;

@Component
public class TitleChecker implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔍 Checking game titles...");
        List<Map<String, Object>> games = jdbcTemplate.queryForList("SELECT title FROM GAME");
        for (Map<String, Object> game : games) {
            System.out.println("TITLE: [" + game.get("title") + "]");
        }
    }
}
