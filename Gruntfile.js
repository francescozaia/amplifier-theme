
module.exports = function(grunt) {
    grunt.initConfig({
        shopify: {
            options: {
                api_key: "006c2c3580d255dd0b0c91386eab5319",
                password: "4aa6c0b74fb306e21ffec736a2ec4eb5",
                url: "development-worst-glass-ever.myshopify.com",
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