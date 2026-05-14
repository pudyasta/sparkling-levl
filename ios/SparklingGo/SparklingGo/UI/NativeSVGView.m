// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

#import "NativeSVGView.h"
#import <Lynx/LynxComponentRegistry.h>
#import <Lynx/LynxPropsProcessor.h>
#import <Lynx/LynxUIOwner.h>

@implementation NativeSVGView

- (WKWebView *)createView {
    WKWebViewConfiguration *config = [[WKWebViewConfiguration alloc] init];
    WKWebView *webView = [[WKWebView alloc] initWithFrame:CGRectZero configuration:config];
    webView.scrollView.scrollEnabled = NO;
    webView.backgroundColor = [UIColor clearColor];
    webView.opaque = NO;
    webView.scrollView.backgroundColor = [UIColor clearColor];
    return webView;
}

LYNX_PROP_SETTER("src", setSrc, NSString *) {
    if (!value || [value length] == 0) return;

    NSString *svgContent = nil;

    if ([value hasPrefix:@"data:image/svg+xml;base64,"]) {
        NSString *base64 = [value substringFromIndex:[@"data:image/svg+xml;base64," length]];
        NSData *decoded = [[NSData alloc] initWithBase64EncodedString:base64
                                                             options:NSDataBase64DecodingIgnoreUnknownCharacters];
        svgContent = [[NSString alloc] initWithData:decoded encoding:NSUTF8StringEncoding];
    } else if ([value hasPrefix:@"<svg"] || [value hasPrefix:@"<?xml"]) {
        svgContent = value;
    } else if ([value hasPrefix:@"http://"] || [value hasPrefix:@"https://"]) {
        NSURL *url = [NSURL URLWithString:value];
        if (url) {
            [self.view loadRequest:[NSURLRequest requestWithURL:url]];
        }
        return;
    }

    if (svgContent) {
        NSString *html = [NSString stringWithFormat:
            @"<!DOCTYPE html><html><head>"
             "<meta name='viewport' content='width=device-width,initial-scale=1'>"
             "<style>"
             "html,body{margin:0;padding:0;background:transparent;width:100%%;height:100%%;overflow:hidden;}"
             "svg{display:block;width:100%%;height:100%%;}"
             "</style>"
             "</head><body>%@</body></html>",
            svgContent];
        [self.view loadHTMLString:html baseURL:nil];
    }
}

@end