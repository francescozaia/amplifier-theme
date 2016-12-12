

module.exports = function(grunt) {
    grunt.initConfig({
        shopify: {
            options: {
                api_key: process.env.THEMEKIT_APIKEY,
                password: process.env.THEMEKIT_PASSWORD,
                url: process.env.THEMEKIT_STORE,
                theme: process.env.THEMEKIT_THEME_ID,
                base: "shop/"
            }
        },
        watch: {
            shopify: {
                files: ["shop/**"],
                tasks: ["shopify"]
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shopify');
    grunt.registerTask('default', 'watch:shopify');
}