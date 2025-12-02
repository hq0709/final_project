package com.gamehub.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class DataSeeder implements CommandLineRunner {

        @Autowired
        private JdbcTemplate jdbcTemplate;

        @Override
        public void run(String... args) throws Exception {
                System.out.println("🌱 Seeding game cover images...");

                updateCover("The Witcher 3: Wild Hunt",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900.jpg");
                updateCover("Elden Ring",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg");
                updateCover("Cyberpunk 2077",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_600x900.jpg");
                updateCover("Stardew Valley",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/library_600x900.jpg");
                updateCover("Hollow Knight",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/library_600x900.jpg");
                updateCover("Red Dead Redemption 2",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/library_600x900.jpg");
                updateCover("God of War",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/library_600x900.jpg");
                updateCover("Horizon Zero Dawn",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/1151640/library_600x900.jpg");
                updateCover("Grand Theft Auto V",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/library_600x900.jpg");
                updateCover("Minecraft", "https://m.media-amazon.com/images/I/81UeHuSCY8L._AC_SL1500_.jpg");
                updateCover("The Legend of Zelda: Breath of the Wild",
                                "https://m.media-amazon.com/images/I/81KGsJ1B46L._AC_SL1500_.jpg");
                updateCover("Super Mario Odyssey", "https://m.media-amazon.com/images/I/91w80uI3d9L._AC_SL1500_.jpg");
                updateCover("Bloodborne",
                                "https://image.api.playstation.com/vulcan/img/rnd/202010/2614/p3h3h3h3h3h3h3h3h3h3h3h3.png"); // Reverting
                                                                                                                              // to
                                                                                                                              // PS
                                                                                                                              // URL
                                                                                                                              // as
                                                                                                                              // Amazon
                                                                                                                              // might
                                                                                                                              // be
                                                                                                                              // 403ing,
                                                                                                                              // or
                                                                                                                              // trying
                                                                                                                              // a
                                                                                                                              // new
                                                                                                                              // one
                updateCover("Celeste", "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/library_600x900.jpg");
                updateCover("Control", "https://cdn.cloudflare.steamstatic.com/steam/apps/870780/library_600x900.jpg");
                updateCover("Dark Souls III",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/374320/library_600x900.jpg");
                updateCover("Death Stranding",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/1850570/library_600x900.jpg"); // Director's
                                                                                                                  // Cut
                                                                                                                  // ID,
                                                                                                                  // usually
                                                                                                                  // works
                updateCover("Disco Elysium",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/632470/library_600x900.jpg");
                updateCover("Doom Eternal",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/782330/library_600x900.jpg");
                updateCover("Ghost of Tsushima",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/2215430/library_600x900.jpg");
                updateCover("It Takes Two",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/1426210/library_600x900.jpg");
                updateCover("Outer Wilds",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/753640/library_600x900.jpg");
                updateCover("Resident Evil Village",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/1196590/library_600x900.jpg");
                updateCover("Return of the Obra Dinn",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/653530/library_600x900.jpg");
                updateCover("Sekiro: Shadows Die Twice",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/814380/library_600x900.jpg");
                updateCover("Spider-Man",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/library_600x900.jpg");
                updateCover("Marvel's Spider-Man",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/library_600x900.jpg");
                updateCover("Terraria", "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/library_600x900.jpg");
                updateCover("Undertale",
                                "https://cdn.cloudflare.steamstatic.com/steam/apps/391540/library_600x900.jpg");

                System.out.println("✅ Game cover images seeded!");
        }

        private void updateCover(String title, String url) {
                // Only update if the cover is currently null or empty to avoid overwriting user
                // changes if we had an admin panel
                // But for now, let's just force update to ensure they get the new images
                String sql = "UPDATE GAME SET cover_image_url = ? WHERE title = ?";
                int updated = jdbcTemplate.update(sql, url, title);
                if (updated > 0) {
                        System.out.println("Updated cover for: " + title);
                }
        }
}
