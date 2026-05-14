// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

#import "VideoPlayerView.h"
#import <Lynx/LynxComponentRegistry.h>
#import <Lynx/LynxPropsProcessor.h>
#import <Lynx/LynxUIOwner.h>
#import <AVFoundation/AVFoundation.h>
#import <AVKit/AVKit.h>

@interface VideoPlayerContainerView : UIView
@property (nonatomic, strong) AVPlayer *player;
@property (nonatomic, strong) AVPlayerLayer *playerLayer;
@end

@implementation VideoPlayerContainerView

+ (Class)layerClass {
    return [AVPlayerLayer class];
}

- (AVPlayerLayer *)playerLayerFromView {
    return (AVPlayerLayer *)self.layer;
}

- (void)setPlayer:(AVPlayer *)player {
    _player = player;
    self.playerLayerFromView.player = player;
    self.playerLayerFromView.videoGravity = AVLayerVideoGravityResizeAspect;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    self.playerLayerFromView.frame = self.bounds;
}

@end

@interface VideoPlayerView ()
@property (nonatomic, strong) AVPlayer *player;
@property (nonatomic, weak) AVPlayerViewController *fullscreenVC;
@property (nonatomic, strong) id timeObserver;
@end

@implementation VideoPlayerView

- (UIView *)createView {
    VideoPlayerContainerView *container = [[VideoPlayerContainerView alloc] initWithFrame:CGRectZero];
    container.backgroundColor = [UIColor blackColor];

    self.player = [[AVPlayer alloc] init];
    container.player = self.player;

    // Add tap gesture to toggle fullscreen
    UITapGestureRecognizer *tap = [[UITapGestureRecognizer alloc] initWithTarget:self
                                                                          action:@selector(handleTap:)];
    tap.numberOfTapsRequired = 2;
    [container addGestureRecognizer:tap];

    return container;
}

- (void)handleTap:(UITapGestureRecognizer *)recognizer {
    [self openFullscreen];
}

- (void)openFullscreen {
    UIViewController *topVC = [self topViewController];
    if (!topVC) return;

    AVPlayerViewController *playerVC = [[AVPlayerViewController alloc] init];
    playerVC.player = self.player;
    self.fullscreenVC = playerVC;

    [topVC presentViewController:playerVC animated:YES completion:^{
        [playerVC.player play];
    }];
}

- (UIViewController *)topViewController {
    UIWindowScene *scene = nil;
    for (UIWindowScene *ws in [UIApplication sharedApplication].connectedScenes) {
        if (ws.activationState == UISceneActivationStateForegroundActive) {
            scene = ws;
            break;
        }
    }
    UIWindow *window = scene.windows.firstObject;
    UIViewController *vc = window.rootViewController;
    while (vc.presentedViewController) {
        vc = vc.presentedViewController;
    }
    return vc;
}

LYNX_PROP_SETTER("src", setSrc, NSString *) {
    if (!value || [value length] == 0) return;

    NSURL *url = nil;
    if ([value hasPrefix:@"http://"] || [value hasPrefix:@"https://"]) {
        url = [NSURL URLWithString:value];
    } else {
        url = [NSURL fileURLWithPath:value];
    }

    if (!url) return;

    AVPlayerItem *item = [AVPlayerItem playerItemWithURL:url];
    [self.player replaceCurrentItemWithPlayerItem:item];
}

LYNX_PROP_SETTER("autoplay", setAutoplay, BOOL) {
    if (value) {
        [self.player play];
    } else {
        [self.player pause];
    }
}

- (void)dealloc {
    if (self.timeObserver) {
        [self.player removeTimeObserver:self.timeObserver];
        self.timeObserver = nil;
    }
    [self.player pause];
}

@end