// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

#import "NativeSVGView.h"
#import <Lynx/LynxComponentRegistry.h>
#import <Lynx/LynxPropsProcessor.h>
#import <Lynx/LynxUIOwner.h>

@interface NativeSVGView ()
@property (nonatomic, copy) NSString *svgContent;
@property (nonatomic, copy) NSString *remoteURL;
@end

@implementation NativeSVGView

- (WKWebView *)createView {
    WKWebViewConfiguration *config = [[WKWebViewConfiguration alloc] init];
    WKWebView *webView = [[WKWebView alloc] initWithFrame:CGRectZero configuration:config];
    webView.scrollView.scrollEnabled = NO;
    webView.scrollView.bounces = NO;
    webView.backgroundColor = [UIColor clearColor];
    webView.opaque = NO;
    webView.scrollView.backgroundColor = [UIColor clearColor];
    // Prevent UIKit from adjusting scroll insets which can offset the SVG content
    webView.scrollView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
    return webView;
}

// Build an HTML page whose viewport exactly matches `size` so the SVG
// renders at the right dimensions without zooming or cropping.
- (NSString *)htmlForSVGContent:(NSString *)svgContent size:(CGSize)size {
    int w = (int)ceil(size.width);
    int h = (int)ceil(size.height);
    return [NSString stringWithFormat:
        @"<!DOCTYPE html><html><head>"
         "<meta name='viewport' content='width=%d,height=%d,initial-scale=1,user-scalable=no'>"
         "<style>"
         "html,body{margin:0;padding:0;width:%dpx;height:%dpx;overflow:hidden;background:transparent;}"
         "svg{display:block;width:%dpx;height:%dpx;}"
         "</style>"
         "</head><body>%@</body></html>",
        w, h, w, h, w, h, svgContent];
}

// Same for a remote SVG URL — load it via <img> so object-fit applies correctly.
- (NSString *)htmlForRemoteURL:(NSString *)url size:(CGSize)size {
    int w = (int)ceil(size.width);
    int h = (int)ceil(size.height);
    return [NSString stringWithFormat:
        @"<!DOCTYPE html><html><head>"
         "<meta name='viewport' content='width=%d,height=%d,initial-scale=1,user-scalable=no'>"
         "<style>"
         "html,body{margin:0;padding:0;width:%dpx;height:%dpx;overflow:hidden;background:transparent;}"
         "img{display:block;width:%dpx;height:%dpx;object-fit:cover;}"
         "</style>"
         "</head><body><img src='%@'/></body></html>",
        w, h, w, h, w, h, url];
}

- (void)reloadContent {
    CGSize size = self.view.frame.size;
    if (size.width <= 0 || size.height <= 0) return;

    if (self.svgContent) {
        [self.view loadHTMLString:[self htmlForSVGContent:self.svgContent size:size]
                         baseURL:nil];
    } else if (self.remoteURL) {
        [self.view loadHTMLString:[self htmlForRemoteURL:self.remoteURL size:size]
                         baseURL:nil];
    }
}

LYNX_PROP_SETTER("src", setSrc, NSString *) {
    if (!value || [value length] == 0) return;

    self.svgContent = nil;
    self.remoteURL = nil;

    if ([value hasPrefix:@"data:image/svg+xml;base64,"]) {
        NSString *base64 = [value substringFromIndex:[@"data:image/svg+xml;base64," length]];
        NSData *decoded = [[NSData alloc] initWithBase64EncodedString:base64
                                                             options:NSDataBase64DecodingIgnoreUnknownCharacters];
        self.svgContent = [[NSString alloc] initWithData:decoded encoding:NSUTF8StringEncoding];
    } else if ([value hasPrefix:@"<svg"] || [value hasPrefix:@"<?xml"]) {
        self.svgContent = value;
    } else if ([value hasPrefix:@"http://"] || [value hasPrefix:@"https://"]) {
        self.remoteURL = value;
    }

    // Try immediate load; Lynx may have already applied layout by this point.
    [self reloadContent];

    // Deferred reload as a safety net: Lynx layout sometimes settles after
    // props are applied, so the frame can be zero on the first call.
    __weak typeof(self) weakSelf = self;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.05 * NSEC_PER_SEC)),
                   dispatch_get_main_queue(), ^{
        [weakSelf reloadContent];
    });
}

@end
