var fs = require('fs');
var ejs = require('ejs');
// var homeTemplate = fs.readFileSync('../lib/ejs/homeTemplate.ejs');
// var communitiesTile = fs.readFileSync('../lib/ejs/communitiesTile.ejs');
var db = require('../lib/database.js');

//삭제 예정

module.exports = {
    HTML: function(banner, userName = " "){
        return `
        <!DOCTYPE HTML>
        <html>
            <head>
                <title>StudyCatch</title>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
                <link rel="stylesheet" href="/css/main.css" />
                <noscript><link rel="stylesheet" href="/css/noscript.css" /></noscript>
            </head>
            <body class="is-preload">

                <!-- Wrapper -->
                    <div id="wrapper">

                        <!-- Header -->
                            <header id="header" class="alt">
                                <a href="/" class="logo"><strong>STUDYCATCH</strong> <span>By Conesecutive</span></a>
                                <nav>
                                    <a href="#"><h3 style = "margin: 0;">${userName}</h3></a>
                                    <a href="#menu">Menu</a>
                                </nav>
                            </header>

                        <!-- Menu -->
                            <nav id="menu">
                                <ul class="links">
                                    <li><a href="index.html">Home</a></li>
                                    <li><a href="/home/create_group">커뮤니티 생성</a></li>
                                    <li><a href="generic.html">Generic</a></li>
                                    <li><a href="elements.html">Elements</a></li>
                                </ul>
                                <ul class="actions stacked">
                                    <li><a href="/join/" class="button primary fit">Get Started</a></li>
                                    <li><a href="/login/" class="button fit">Log In</a></li>
                                </ul>
                            </nav>

                        <!-- Banner -->
                            ${banner}

                        <!-- Main -->
                            <div id="main">

                                <!-- One -->
                                    <section id="one" class="tiles">
                                        <article>
                                            <span class="image">
                                                <img src="images/pic01.jpg" alt="" />
                                            </span>
                                            <header class="major">
                                                <h3><a href="landing.html" class="link">Aliquam</a></h3>
                                                <p>Ipsum dolor sit amet</p>
                                            </header>
                                        </article>
                                        <article>
                                            <span class="image">
                                                <img src="images/pic02.jpg" alt="" />
                                            </span>
                                            <header class="major">
                                                <h3><a href="landing.html" class="link">Tempus</a></h3>
                                                <p>feugiat amet tempus</p>
                                            </header>
                                        </article>
                                        <article>
                                            <span class="image">
                                                <img src="images/pic03.jpg" alt="" />
                                            </span>
                                            <header class="major">
                                                <h3><a href="landing.html" class="link">Magna</a></h3>
                                                <p>Lorem etiam nullam</p>
                                            </header>
                                        </article>
                                        <article>
                                            <span class="image">
                                                <img src="images/pic04.jpg" alt="" />
                                            </span>
                                            <header class="major">
                                                <h3><a href="landing.html" class="link">Ipsum</a></h3>
                                                <p>Nisl sed aliquam</p>
                                            </header>
                                        </article>
                                        <article>
                                            <span class="image">
                                                <img src="images/pic05.jpg" alt="" />
                                            </span>
                                            <header class="major">
                                                <h3><a href="landing.html" class="link">Consequat</a></h3>
                                                <p>Ipsum dolor sit amet</p>
                                            </header>
                                        </article>
                                        <article>
                                            <span class="image">
                                                <img src="images/pic06.jpg" alt="" />
                                            </span>
                                            <header class="major">
                                                <h3><a href="landing.html" class="link">Etiam</a></h3>
                                                <p>Feugiat amet tempus</p>
                                            </header>
                                        </article>
                                        <article>
                                            <span class="image">
                                                <img src="images/pic06.jpg" alt="" />
                                            </span>
                                            <header class="major">
                                                <h3><a href="landing.html" class="link">테스트</a></h3>
                                                <p>Feugiat amet tempus</p>
                                            </header>
                                        </article>
                                        <article>
                                            <span class="image">
                                                <img src="images/pic06.jpg" alt="" />
                                            </span>
                                            <header class="major">
                                                <h3><a href="landing.html" class="link">T2</a></h3>
                                                <p>Feugiat amet tempus</p>
                                            </header>
                                        </article>
                                    </section>

                                <!-- Two -->
                                    <section id="two">
                                        <div class="inner">
                                            <header class="major">
                                                <h2>Massa libero</h2>
                                            </header>
                                            <p>Nullam et orci eu lorem consequat tincidunt vivamus et sagittis libero. Mauris aliquet magna magna sed nunc rhoncus pharetra. Pellentesque condimentum sem. In efficitur ligula tate urna. Maecenas laoreet massa vel lacinia pellentesque lorem ipsum dolor. Nullam et orci eu lorem consequat tincidunt. Vivamus et sagittis libero. Mauris aliquet magna magna sed nunc rhoncus amet pharetra et feugiat tempus.</p>
                                            <ul class="actions">
                                                <li><a href="landing.html" class="button next">Get Started</a></li>
                                            </ul>
                                        </div>
                                    </section>

                            </div>

                        <!-- Footer -->
                            <footer id="footer">
                                <div class="inner">
                                    <ul class="icons">
                                        <li><a href="#" class="icon brands alt fa-twitter"><span class="label">Twitter</span></a></li>
                                        <li><a href="#" class="icon brands alt fa-facebook-f"><span class="label">Facebook</span></a></li>
                                        <li><a href="#" class="icon brands alt fa-instagram"><span class="label">Instagram</span></a></li>
                                        <li><a href="#" class="icon brands alt fa-github"><span class="label">GitHub</span></a></li>
                                        <li><a href="#" class="icon brands alt fa-linkedin-in"><span class="label">LinkedIn</span></a></li>
                                    </ul>
                                    <ul class="copyright">
                                        <li>&copy; Consecutive</li><li>Design: <a href="#">StudyCatch</a></li>
                                    </ul>
                                </div>
                            </footer>

                    </div>

                <!-- Scripts -->
                    <script src="/js/jquery.min.js"></script>
                    <script src="/js/jquery.scrolly.min.js"></script>
                    <script src="/js/jquery.scrollex.min.js"></script>
                    <script src="/js/browser.min.js"></script>
                    <script src="/js/breakpoints.min.js"></script>
                    <script src="/js/util.js"></script>
                    <script src="/js/main.js"></script>

            </body>
        </html>
    `;
    }
}

