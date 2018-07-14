package com.me4502.navitron;

import static spark.Spark.get;
import static spark.Spark.port;

public class NavitronAutodriveSystem {

    public static void main(String[] args) {
        port(8080);
        get("/hello", (req, res) -> "Hello World");
    }
}
