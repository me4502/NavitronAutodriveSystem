package com.me4502.navitron;

import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.staticFiles;

import spark.ModelAndView;
import spark.template.jinjava.JinjavaEngine;

import java.util.HashMap;
import java.util.Map;

public class NavitronAutodriveSystem {

    public static void main(String[] args) {
        port(8080);
        staticFiles.location("/public");
        get("/", (req, res) -> {
            Map<String, Object> model = new HashMap<>();
            return new ModelAndView(model, "index.html");
        }, new JinjavaEngine());
        get("/hello", (req, res) -> "Hello World");
    }
}
