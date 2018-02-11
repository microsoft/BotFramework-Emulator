import * as dl from "./node_modules/botframework-directlinejs/built/directLine";
export const config = require('./mock_dl/server_config.json') as { bot: dl.User, port: number, widthTests: { [id: string]: number } };
const local_url = "http://localhost:" + config.port + "/";
const asset_url = local_url + "assets/";
const bot = config.bot;

/*
* Function that renders Adaptive Cards
*
*/
export var adaptive_cardsFn = function (json: any) {
    var acMessage: dl.Message = {
        type: "message",
        from: bot,
        timestamp: new Date().toUTCString(),
        channelId: "webchat",
        attachments: [
            <dl.AdaptiveCard>{ contentType: "application/vnd.microsoft.card.adaptive", content: json }
        ]
    };

    return acMessage;
}

/*
 * Activity for Animation Card
 *
 */
export var ani_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachments: [
        <dl.AnimationCard>{
            contentType: "application/vnd.microsoft.card.animation",
            content: {
                title: "title",
                subtitle: "animation",
                text: "No buttons, No Image, Autoloop, Autostart, Sharable",
                media: [{ url: asset_url + "surface_anim.gif", profile: "animation" }],
                autoloop: true,
                autostart: true
            }
        }
    ]
}

/*
 * Activity for Audio Raw
 *
 */
export var audio_raw: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachments: [
        <dl.Media>{
            contentType: "audio/mpeg",
            contentUrl: asset_url + "bftest.mp3",
            name: "BotFramework Test",
        }
    ]
}

/*
 * Activity for Audio Card
 *
 */
export var audio_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachments: [
        <dl.AudioCard>{
            contentType: "application/vnd.microsoft.card.audio",
            content: {
                title: "BotFramework Test",
                subtitle: "audio test",
                text: "No buttons, No Image, Autoloop, Autostart, Sharable",
                media: [{ url: asset_url + "bftest.mp3", profile: "audiocard" }],
                autoloop: true,
                autostart: true
            }
        }
    ]
}

/*
 * Activity for Carousel
 *
 */
export var car_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachmentLayout: "carousel",
    attachments: [
        <dl.HeroCard>{
            contentType: "application/vnd.microsoft.card.hero",
            content: {
                title: "Details about image 1",
                subtitle: "This is the subtitle",
                text: "Price: $XXX.XX USD",
                images: [
                    {
                        url: asset_url + "surface1.jpg",
                    }
                ],
                buttons: [
                    {
                        type: "imBack",
                        value: "Place to buy",
                        title: "Places To Buy"
                    },
                    {
                        type: "imBack",
                        value: "Related Products",
                        title: "Related Products"
                    }
                ]
            }
        },
        <dl.HeroCard>{
            contentType: "application/vnd.microsoft.card.hero",
            content: {
                title: "Details about image 2",
                subtitle: "This is the subtitle",
                text: "Price: $XXX.XX USD",
                images: [
                    {
                        "url": asset_url + "surface2.jpg"
                    }
                ],
                buttons: [
                    {
                        "type": "imBack",
                        "value": "Place to buy",
                        "title": "Places To Buy"
                    },
                    {
                        "type": "imBack",
                        "value": "Related Products",
                        "title": "Related Products"
                    }
                ]
            }
        },
        <dl.HeroCard>{
            contentType: "application/vnd.microsoft.card.hero",
            content: {
                title: "Details about image 3",
                subtitle: "This is the subtitle",
                text: "Price: $XXX.XX USD",
                images: [
                    {
                        "url": asset_url + "surface3.jpg"
                    }
                ],
                buttons: [
                    {
                        "type": "imBack",
                        "value": "Place to buy",
                        "title": "Places To Buy"
                    },
                    {
                        "type": "imBack",
                        "value": "Related Products",
                        "title": "Related Products"
                    }
                ]
            }
        },
        <dl.HeroCard>{
            contentType: "application/vnd.microsoft.card.hero",
            content: {
                title: "Details about image 4",
                subtitle: "This is the subtitle",
                text: "Price: $XXX.XX USD",
                images: [
                    {
                        "url": asset_url + "surface4.jpg"
                    }
                ],
                buttons: [
                    {
                        "type": "imBack",
                        "value": "Place to buy",
                        "title": "Places To Buy"
                    },
                    {
                        "type": "imBack",
                        "value": "Related Products",
                        "title": "Related Products"
                    }
                ]
            }
        },
    ]
}

export var smallcar_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachmentLayout: "carousel",
    attachments: [car_card.attachments[0]]
}

/*
 * Activity for Document
 *
 */

export var document_plain: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachments: [
        <dl.UnknownMedia>{
            contentType: "text/plain",
            contentUrl: asset_url + "test.txt",
            name: "test.txt"
        }
    ]
}

export var document_word: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachments: [
        <dl.UnknownMedia>{
            contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            contentUrl: asset_url + "test.docx",
            name: "test.docx"
        }
    ]
}

/*
 * Activity for Hero Card
 *
 */
export var hero_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachmentLayout: "carousel",
    attachments: [
        <dl.HeroCard>{
            contentType: "application/vnd.microsoft.card.hero",
            content: {
                title: "Details about image 1",
                subtitle: "This is the subtitle",
                text: "Price: $XXX.XX USD",
                images: [
                    {
                        "url": asset_url + "surface1.jpg",
                        "alt": "Microsoft Surface Alt",
                        "tap": {
                            "type": "openUrl",
                            "title": "Tapped it!",
                            "value": local_url + "testurl1.html"
                        }
                    }
                ],
                buttons: [
                    {
                        "type": "imBack",
                        "value": "imBack Button",
                        "title": "imBack Action"
                    },
                    {
                        "type": "postBack",
                        "value": "postBack Button",
                        "title": "postBack Action"
                    }
                ],
                tap: {
                    "type": "openUrl",
                    "title": "Tapped it!",
                    "value": local_url + "testurl2.html"
                }
            }
        }
    ]
}

/*
 * Activity for Image Raw
 *
 */
export var image_raw: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachments: [
        <dl.Media>{
            contentType: "image/jpg",
            contentUrl: asset_url + "surface1.jpg",
            name: "Microsoft Surface",
        }
    ]
}

export var image_svg: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachments: [
        <dl.Media>{
            contentType: "image/svg+xml",
            contentUrl: asset_url + "bf_square.svg",
            name: "Microsoft Bot Framework",
        }
    ]
}

/*
 * Activity for Markdown
 *
 */
export var mar_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    textFormat: "markdown",
    text: "## Basic formatting\r\n\r\nParagraphs can be written like so. A paragraph is the \r\nbasic block of Markdown. \r\nA paragraph is what text will turn \r\ninto when there is no reason it should become anything else.\r\n\r\nParagraphs must be separated by a blank line. Basic formatting of *italics* and **bold** is supported. This *can be **nested** like* so.\r\n\r\n#### Lists\r\n\r\n### Ordered list\r\n\r\n1. one\r\n2. two\r\n3. three\r\n4. four\r\n\r\n### Unordered list\r\n\r\n* An item\r\n* Another item\r\n* Yet another item\r\n* And there's more...\r\n\r\n## Paragraph modifiers\r\n\r\n### Code block\r\n\r\n```\r\nCode blocks are very useful for developers and other \r\npeople who look at code or other things that are written \r\nin plain text. As you can see, it uses a fixed-width font.\r\n```\r\n\r\nYou can also make `inline code` to add code into other things.\r\n\r\n### Quote\r\n\r\n> Here is a quote. What this is should be self explanatory. \r\n> Quotes are automatically indented when they are used.\r\n\r\n# h1\r\n## h2\r\n### h3\r\n#### h4\r\n\r\n### Headings *can* also contain **formatting**\r\n\r\n## URLs\r\n\r\nURLs can be made in a handful of ways:\r\n\r\n* A named link to [MarkItDown][3]. The easiest way to do these is to select what you want to make a link and hit `Ctrl+L`.\r\n* Another named link to [MarkItDown](http://www.markitdown.net/)\r\n* Some links have [query strings that need encoding](https://bing.com?q=some value)\r\n* Sometimes you just want a URL like <http://www.markitdown.net/>.\r\n\r\n## Images\r\nThis is an image\r\n\r\n![Alt for Surface](" + asset_url + "surface1.jpg)\r\n\r\n\r\n## Horizontal rule\r\n\r\nA horizontal rule is a line that goes across the middle of the page.\r\n\r\n---\r\n\r\nIt's sometimes handy for breaking things up.\r\n\r\n\r\n## Table\r\n|header1|header 2|\r\n|----|----|\r\n| cell 1 | cell 2|\r\n| cell three | cell four|\r\n\r\n## Whitespace\r\n\r\nHere's a line.\r\n\r\nThis has the standard two newlines before it.\r\n\r\n\r\n\r\nThis has four newlines before it.\r\n\r\n\r\n\r\n\r\n\r\nThis has six newlines before it.\r\n\r\n<br/><br/><br/><br/>This has two newlines and four &lt;br/&gt; tags before it."
}

export var mar_encode_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    textFormat: "markdown",
    text: "Some links are [already encoded](https://bing.com?q=some%20value) and some have [query strings that need encoding](https://bing.com?q=some value) and these can occur [multiple](https://bing.com?q=some%20value) [times](https://bing.com?q=some value) in one message. (Links can even appear [within](https://bing.com?q=some%20value) [parentheses](https://bing.com?q=some value) too.)\r\n\r\n\r\nImages must encode URL component with title attribute\r\n\r\n\r\n![Alt for Surface](" + asset_url + "surface1.jpg?abc=123 456 \"Title for Surface!\")\r\n\r\n\r\n"
}

export var mar_newlines_single_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    textFormat: "markdown",
    text: "**Windows** single newline->\r\n<-finish. \r\n\r\n**Unix** single newline->\n<-finish."
}

export var mar_newlines_double_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    textFormat: "markdown",
    text: "**Windows** double newline->\r\n \r\n<-finish. \r\n\r\n**Unix** double newline->\n \n<-finish."
}

export var mar_newlines_ddouble_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    textFormat: "markdown",
    text: "**Windows** double-double newline->\r\n \r\n \r\n \r\n<-finish. \r\n\r\n**Unix** double-double newline->\n \n \n \n<-finish."
}

/*
 * Activity for Multimedia Attachments
 *
 */
export var multimedia_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    attachments: [
        <dl.AnimationCard>{
            contentType: "application/vnd.microsoft.card.animation",
            content: {
                title: "Multimedia Content",
                subtitle: "Subtitle",
                text: "Text",
                media: [
                    { url: asset_url + "surface_anim.gif", profile: "animation" },
                    { url: asset_url + "surface_anim.gif", profile: "animation2" }
                ],
                autoloop: true,
                autostart: true
            }
        },
        <dl.AudioCard>{
            contentType: "application/vnd.microsoft.card.audio",
            content: {
                title: "BotFramework Test",
                subtitle: "audio test",
                text: "No buttons, No Image, Autoloop, Autostart, Sharable",
                media: [
                    { url: asset_url + "bftest.mp3", profile: "audiocard" },
                    { url: asset_url + "bftest.mp3", profile: "audiocard2" }
                ],
                autoloop: true,
                autostart: true
            }
        },
        <dl.VideoCard>{
            contentType: "application/vnd.microsoft.card.video",
            content: {
                title: "Microsoft Band",
                subtitle: "Large Video",
                text: "No buttons, No Image, Autoloop, Autostart, No Sharable",
                media: [
                    { url: asset_url + "msband.mp4", profile: "videocard" },
                    { url: asset_url + "msband.mp4", profile: "videocard2" }
                ],
                image: { url: asset_url + "ms-band1.jpg" },
                autoloop: true,
                autostart: true
            }
        }
    ]
}

/*
 * Activity for SignIn
 *
 */
export var si_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    attachments: [
        <dl.Signin>{
            contentType: "application/vnd.microsoft.card.signin",
            content: {
                text: "Login to signin sample",
                buttons: [
                    {
                        type: "signin",
                        title: "Signin",
                        value: "https://login.live.com/"
                    }
                ]
            }
        }
    ]
}

/*
 * Activity for SuggestedActions
 *
 */
export var suggested_actions_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    textFormat: "plain",
    text: "Message Text",
    suggestedActions: {
        actions: [
            {
                type: "imBack",
                title: "Blue",
                value: "Blue",
                image: asset_url + "square-icon.png"
            },
            {
                type: "imBack",
                title: "Red",
                value: "Red",
                image: asset_url + "square-icon-red.png"
            },
            {
                type: "imBack",
                title: "Green",
                value: "Green",
                image: asset_url + "square-icon-green.png"
            }
        ]
    }
}

/*
 * Activity for Receipt Card
 *
 */
export var receipt_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachmentLayout: "carousel",
    attachments: [
        <dl.Receipt>{
            contentType: "application/vnd.microsoft.card.receipt",
            content: {
                title: "Surface Pro 4",
                subtitle: "This is the subtitle",
                items: [
                    {
                        title: "Surface Pro 4",
                        subtitle: "Surface Pro 4 is a powerful, versatile, lightweight laptop.",
                        text: "Surface does more. Just like you. For one device that does everything, you need more than a mobile OS.",
                        image: {
                            "url": asset_url + "surface1.jpg",
                            "alt": "Microsoft Surface Alt",
                            "tap": {
                                "type": "openUrl",
                                "title": "Tapped it!",
                                "value": local_url + "testurl1.html"
                            }
                        },
                        price: "$XXX"
                    },
                    {
                        title: "Surface Pro 4 (2) - No subtitle, No text.",
                        image: {
                            "url": asset_url + "surface2.jpg",
                            "alt": "Microsoft Surface Alt",
                            "tap": {
                                "type": "call",
                                "title": "Call back!",
                                "value": "1234567890"
                            }
                        },
                        price: "$XXX"
                    },
                    {
                        title: "Surface Pro 4 (3) - No subtitle, No text, No image",
                        price: "$XXX"
                    }
                ],
                facts: [
                    {
                        key: "Order Number",
                        value: "Value 1"
                    },
                    {
                        key: "Expected Delivery Time",
                        value: "Value 2"
                    },
                    {
                        key: "Payment Method",
                        value: "Value 3"
                    },
                    {
                        key: "Delivery Address",
                        value: "Value 4"
                    }
                ],
                total: "0.01",
                tax: "XXX.XX",
                buttons: [
                    {
                        type: "imBack",
                        title: "imBack Button",
                        value: "imBack Action"
                    },
                    {
                        type: "postBack",
                        title: "postBack Button",
                        value: "postBack Action"
                    }
                ],
                tap: {
                    "type": "openUrl",
                    "title": "Tapped it!",
                    "value": local_url + "testurl2.html"
                }
            }
        }
    ]
}

/*
 * Activity for Text
 *
 */
export var text_empty_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    textFormat: "markdown",
    text: " "
}

/*
 * Activity for Thumbnail Card
 *
 */
export var thumbnail_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    attachments: [
        <dl.Thumbnail>{
            contentType: "application/vnd.microsoft.card.thumbnail",
            content: {
                title: "Details about image 1",
                subtitle: "This is the subtitle",
                text: "Price: $XXX.XX USD",
                images: [
                    {
                        "url": asset_url + "surface1.jpg",
                        "alt": "Microsoft Surface Alt",
                        "tap": {
                            "type": "openUrl",
                            "title": "Tapped it!",
                            "value": local_url + "testurl1.html"
                        }
                    }
                ],
                buttons: [
                    {
                        "type": "imBack",
                        "value": "imBack Button",
                        "title": "imBack Action"
                    },
                    {
                        "type": "postBack",
                        "value": "postBack Button",
                        "title": "postBack Action"
                    }
                ],
                tap: {
                    "type": "openUrl",
                    "title": "Tapped it!",
                    "value": local_url + "testurl2.html"
                }
            }
        }
    ]
}

/*
 * Activity for Typing
 *
 */
export var typing: dl.Typing = {
    type: "typing",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat"
}

/*
 * Activity for Upload
 *
 */
export var upload_txt: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "uploading..."
}

/*
 * Activity for Video Raw
 *
 */
export var video_raw: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachments: [
        <dl.Media>{
            contentType: "video/mp4",
            contentUrl: asset_url + "msband.mp4",
            name: "Microsoft Band",
        }
    ]
}

/*
 * Activity for Video Card
 *
 */
export var video_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    text: "",
    attachments: [
        <dl.VideoCard>{
            contentType: "application/vnd.microsoft.card.video",
            content: {
                title: "Microsoft Band",
                subtitle: "Large Video",
                text: "No buttons, No Image, Autoloop, Autostart, No Sharable",
                media: [{ url: asset_url + "msband.mp4", profile: "videocard" }],
                image: { url: asset_url + "ms-band1.jpg" },
                autoloop: true,
                autostart: true
            }
        }
    ]
}

/*
 * Activity for XML
 *
 */
export var xml_card: dl.Message = {
    type: "message",
    from: bot,
    timestamp: new Date().toUTCString(),
    channelId: "webchat",
    textFormat: "xml",
    text: "# markdown h1 <h1>xml h1</h1>\r\n *markdown italic* <i>xml italic</i>\r\n **markdown bold** <b>xml bold</b>\r\n ~~markdown strikethrough~~ <s>xml strikethrough</s>"
}