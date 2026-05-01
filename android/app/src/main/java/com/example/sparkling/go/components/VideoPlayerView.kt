package com.example.sparkling.go.components

import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.content.pm.ActivityInfo
import android.os.Build
import android.util.Log
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.lynx.tasm.behavior.LynxContext
import com.lynx.tasm.behavior.LynxProp
import com.lynx.tasm.behavior.ui.LynxUI


class VideoPlayerView(context: LynxContext) : LynxUI<PlayerView>(context) {
    private var player: ExoPlayer? = null
    private var isFullscreen = false
    private var fullscreenDialog: Dialog? = null
    private var fullscreenPlayerView: PlayerView? = null

    override fun createView(context: Context): PlayerView {
        val playerView = PlayerView(context)
        player = ExoPlayer.Builder(context).build()
        playerView.player = player

        playerView.setFullscreenButtonClickListener {
            if (!isFullscreen) openFullscreen() else closeFullscreen()
        }

        return playerView
    }

    private fun openFullscreen() {
        val activity = mContext.baseContext as? Activity ?: return
        isFullscreen = true

        // Create a fullscreen dialog
        fullscreenDialog = Dialog(activity, android.R.style.Theme_Black_NoTitleBar_Fullscreen).apply {
            // Create a new PlayerView inside the dialog, sharing the same player instance
            val fsView = PlayerView(activity).also { fsv ->
                fsv.player = player  // share the same ExoPlayer instance
                fsv.setFullscreenButtonClickListener { closeFullscreen() }
                fullscreenPlayerView = fsv
            }

            setContentView(fsView)
            setOnDismissListener { closeFullscreen() }

            // Force landscape
            window?.attributes = window?.attributes?.apply {
                width = WindowManager.LayoutParams.MATCH_PARENT
                height = WindowManager.LayoutParams.MATCH_PARENT
            }
        }

        // Hide system UI
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            fullscreenDialog?.window?.insetsController?.let {
                it.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
                it.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            fullscreenDialog?.window?.decorView?.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                )
        }

        fullscreenDialog?.show()
    }

    private fun closeFullscreen() {
        if (!isFullscreen) return
        isFullscreen = false

        // Detach player from fullscreen view before dismissing
        fullscreenPlayerView?.player = null
        fullscreenPlayerView = null

        fullscreenDialog?.dismiss()
        fullscreenDialog = null

        // Re-attach player to the original view
        view?.player = player
    }

    @LynxProp(name = "src")
    fun setSrc(src: String?) {
        if (src != null && player != null) {
            val mediaItem = MediaItem.fromUri(src)
            player!!.setMediaItem(mediaItem)
            player!!.prepare()
        }
    }

    @LynxProp(name = "autoplay")
    fun setAutoplay(autoplay: Boolean) {
        player?.playWhenReady = autoplay
    }

    override fun onDetach() {
        super.onDetach()
        fullscreenDialog?.dismiss()
        fullscreenDialog = null
        player?.release()
        player = null
    }
}
