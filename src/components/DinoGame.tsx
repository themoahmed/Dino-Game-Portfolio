"use client";

import { useEffect, useRef, useState } from "react";

const DinoGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(true);
  const isFirstStartRef = useRef(true);
  const hasPlayedBeforeRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Game variables
    let scoreInterval = 0;
    let frameInterval = 0;
    let groundScrollPosition = 0;
    let groundScrollPosition2 = 0;
    let tempGroundStart = 0;
    let isSecondGroundActive = false;
    let currentFrame = 0;
    let isRunningFrame = false;
    let gravity = 0.6;
    let gameSpeed = 0; // Start with game paused
    let isOnGround = true;

    // Variables for randomizing obstacles
    let nextObstacleTime = 0;
    let obstacleSpawnGap = 10; // Reduced initial gap between obstacles

    // Portfolio images variables - organized into groups/sections
    const portfolioGroups = [
      // Group 1
      ["/dino-portfolio/story1.png", "/dino-portfolio/story2.png"],
      // Group 2
      [
        "/dino-portfolio/story1.png", // Replace with actual different images
        "/dino-portfolio/story2.png",
      ],
      // Add more groups as needed
    ];

    // Configuration for portfolio display
    const portfolioConfig = {
      width: 400, // Width of images
      spacing: 300, // Spacing between images within a group
      groupSpacing: canvas.width, // Spacing between different groups
      initialDelay: 10, // Initial delay before first image appears
      speedFactor: 0.7, // Speed relative to game speed
      verticalPosition: 150, // Distance from ground
    };

    // Portfolio items state
    let portfolioItems: {
      image: HTMLImageElement;
      scrollPosition: number;
      width: number;
      height: number;
      isActive: boolean;
      aspectRatio: number;
      groupIndex: number; // Which group this image belongs to
      indexInGroup: number; // Position within its group
    }[] = [];

    // Preload images from all groups
    portfolioGroups.forEach((group, groupIndex) => {
      group.forEach((src, indexInGroup) => {
        const img = new Image();
        img.src = src;

        // Set initial dimensions
        const initialWidth = portfolioConfig.width;
        const initialHeight = 80;

        portfolioItems.push({
          image: img,
          scrollPosition: 0,
          width: initialWidth,
          height: initialHeight,
          isActive: false,
          aspectRatio: 1, // Default aspect ratio until image loads
          groupIndex,
          indexInGroup,
        });

        // Update dimensions when image loads to maintain aspect ratio
        img.onload = () => {
          const index = portfolioItems.findIndex(
            (item) =>
              item.image === img &&
              item.groupIndex === groupIndex &&
              item.indexInGroup === indexInGroup
          );
          if (index !== -1) {
            const aspectRatio = img.width / img.height;
            portfolioItems[index].aspectRatio = aspectRatio;

            // Keep the width fixed and adjust height based on aspect ratio
            portfolioItems[index].height =
              portfolioItems[index].width / aspectRatio;
          }
        };
      });
    });

    let activePortfolioIndex = 0;
    let nextPortfolioTime = portfolioConfig.initialDelay; // Delay before first portfolio item appears

    // Sprite image
    const spriteImage = new Image();
    spriteImage.src = "/sprite3.png";

    // Platform/Ground
    const ground = {
      x: 0,
      y: canvas.height - 100,
      width: canvas.width,
      height: 5,
    };

    // Player object
    const player = {
      x: 100,
      y: canvas.height - 180,
      width: 88,
      height: 110,
      verticalVelocity: 0,
      score: 0,
      highScore: 0,
      jumpForce: 15,
    };

    // Player hitbox for collision detection
    const playerHitbox = {
      x: player.x + 20, // Move hitbox right by 20px
      y: player.y + 10, // Move hitbox down by 10px
      width: player.width - 40, // Reduce width by 40px
      height: player.height - 20, // Reduce height by 20px
    };

    // Define obstacle types and their properties
    const obstacleTypes = {
      CORN: {
        spriteX: 823,
        width: 44, // 860 - 807
        height: 75, // 134 - 44
        y: 59,
      },
      BASKETBALL: {
        spriteX: 876,
        width: 51, // 951 - 876
        height: 50, // 134 - 59
        y: 59,
      },
      TOOTH: {
        spriteX: 936,
        width: 41, // 1028 - 967
        height: 50, // 134 - 59
        y: 59,
      },
      PYRAMID: {
        spriteX: 981,
        width: 128, // 1208 - 1048
        height: 60, // 134 - 59
        y: 59,
      },
    };

    // Current obstacle state
    const obstacle = {
      type: null as keyof typeof obstacleTypes | null,
      scrollPosition: 0,
      isActive: false,
    };

    // Function to spawn a random obstacle
    const spawnObstacle = () => {
      const types = Object.keys(obstacleTypes) as Array<
        keyof typeof obstacleTypes
      >;
      // Filter out PYRAMID if game speed is less than 7
      const availableTypes = types.filter(
        (type) => type !== "PYRAMID" || gameSpeed >= 7
      );
      obstacle.type =
        availableTypes[Math.floor(Math.random() * availableTypes.length)];
      obstacle.scrollPosition = 0;
      obstacle.isActive = true;
    };

    // Game over function
    const handleGameOver = () => {
      gameSpeed = 0;
      setGameOver(true);
      // Do not reset isFirstStart here, so we don't show the start screen again
      // But make sure hasPlayedBefore is true
      hasPlayedBeforeRef.current = true;

      if (player.score > player.highScore) {
        player.highScore = player.score;
        setHighScore(player.score);
      }

      player.score = 0;
      setScore(0);

      // Reset obstacles
      obstacle.scrollPosition = 0;
      obstacle.isActive = false;
      nextObstacleTime = 10;

      // Reset portfolio items
      portfolioItems.forEach((item) => {
        item.isActive = false;
        item.scrollPosition = 0;
      });
      activePortfolioIndex = 0;
      nextPortfolioTime = portfolioConfig.initialDelay;

      scoreInterval = 0;
      frameInterval = 0;
      groundScrollPosition = 0;
      groundScrollPosition2 = 0;
      tempGroundStart = 0;
      isSecondGroundActive = false;
    };

    // Helper function to pad score with leading zeros
    const formatScore = (score: number): string => {
      return score.toString().padStart(5, "0");
    };

    // Key down handler
    const keyDownHandler = (evt: KeyboardEvent) => {
      // Allow both up arrow (38) and space bar (32) for jumping and starting
      if (evt.keyCode === 38 || evt.keyCode === 32) {
        evt.preventDefault(); // Prevent page scrolling with space

        // For jumping when on ground
        if (isOnGround && gameSpeed !== 0) {
          player.verticalVelocity = -player.jumpForce;
        }

        // For starting/restarting the game
        if (gameSpeed === 0) {
          gameSpeed = 5;
          setGameOver(false);

          // If this is the first time playing, mark that they've played before
          if (isFirstStartRef.current) {
            isFirstStartRef.current = false;
            hasPlayedBeforeRef.current = true;
          }

          nextObstacleTime = 10; // Start spawning obstacles sooner
        }
      }
    };

    // Add event listener
    document.addEventListener("keydown", keyDownHandler);

    // Game update function
    const update = () => {
      if (!context) return;

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw start screen if game is paused and it's the first start (never played before)
      if (gameSpeed === 0 && isFirstStartRef.current) {
        // Draw ground first
        context.drawImage(
          spriteImage,
          2,
          142,
          2400,
          16,
          0,
          ground.y - 8,
          2400,
          16
        );

        // Draw standing dinosaur properly positioned on the ground
        context.drawImage(
          spriteImage,
          1338,
          24,
          88,
          110,
          player.x,
          ground.y - player.height, // Position dinosaur on the ground
          player.width,
          player.height
        );

        // Set font for title
        context.font = "bold 32px 'Press Start 2P', monospace";
        context.fillStyle = "#654321"; // Brown color
        context.textAlign = "center";

        // Draw "MOHAMED" title
        context.fillText("MOHAMED", canvas.width / 2, canvas.height / 2 - 20);

        // Set font for instruction text
        context.font = "14px 'Press Start 2P', monospace";
        context.fillStyle = "#8B4513"; // Darker brown

        // Draw "PRESS SPACE KEY TO START" text
        context.fillText(
          "PRESS SPACE KEY TO START",
          canvas.width / 2,
          canvas.height / 2 + 20
        );

        // Reset text alignment
        context.textAlign = "left";

        // Request next frame
        requestAnimationFrame(update);
        return;
      }

      // Draw game over screen if game is paused and player has played before
      if (gameSpeed === 0 && !isFirstStartRef.current) {
        // Draw ground
        context.drawImage(
          spriteImage,
          2,
          142,
          2400,
          16,
          0,
          ground.y - 8,
          2400,
          16
        );

        // Draw standing dinosaur
        context.drawImage(
          spriteImage,
          1338,
          24,
          88,
          110,
          player.x,
          ground.y - player.height,
          player.width,
          player.height
        );


        // Reset text alignment
        context.textAlign = "left";

        // Score text - Chrome Dino style
        context.font = "16px 'Press Start 2P', monospace";
        context.fillStyle = "black";

        // Current score in top right
        const currentScoreText = formatScore(0); // Show 0 for current score on game over
        context.textAlign = "right";
        context.fillText(currentScoreText, canvas.width - 20, 30);

        // High score with "HI" prefix
        context.textAlign = "right";
        const highScoreText = "HI " + formatScore(player.highScore);
        context.fillText(
          highScoreText,
          canvas.width - 40 - context.measureText(currentScoreText).width,
          30
        );

        // Reset text alignment
        context.textAlign = "left";

        // Request next frame
        requestAnimationFrame(update);
        return;
      }

      // Only update physics if game is running
      if (gameSpeed !== 0) {
        if (!isOnGround) {
          player.verticalVelocity += gravity;
        }

        player.y += player.verticalVelocity;
        playerHitbox.y = player.y;

        scoreInterval++;
        if (scoreInterval > 6) {
          player.score++;
          setScore(player.score);
          scoreInterval = 0;
        }

        if (gameSpeed < 20) {
          gameSpeed = 5 + player.score / 200;
        }

        // Update and draw portfolio items
        // This happens before drawing the player so they appear behind
        portfolioItems.forEach((item, index) => {
          if (item.isActive) {
            // Draw the portfolio image with proper aspect ratio
            const displayWidth = item.width;
            const displayHeight = item.height;

            context.drawImage(
              item.image,
              canvas.width - item.scrollPosition,
              ground.y - portfolioConfig.verticalPosition, // Position above ground but below player jump height
              displayWidth,
              displayHeight
            );

            // Move the item
            item.scrollPosition += gameSpeed * portfolioConfig.speedFactor; // Slightly slower than obstacles

            // Deactivate if off screen
            if (item.scrollPosition > canvas.width + displayWidth + 500) {
              item.isActive = false;

              // Only reset the entire portfolio cycle if this was the last item of the last group
              const isLastItem = index === portfolioItems.length - 1;
              if (isLastItem && activePortfolioIndex >= portfolioItems.length) {
                activePortfolioIndex = 0;
                portfolioItems.forEach((i) => {
                  i.isActive = false;
                  i.scrollPosition = 0;
                });
                nextPortfolioTime = portfolioConfig.initialDelay;
              }
            }
          }
        });

        // Activate next portfolio item if it's time
        if (
          nextPortfolioTime <= 0 &&
          activePortfolioIndex < portfolioItems.length
        ) {
          const currentItem = portfolioItems[activePortfolioIndex];
          const prevIndex = activePortfolioIndex - 1;

          // Determine spacing based on whether this is a new group or same group
          let requiredSpacing = portfolioConfig.spacing;

          if (prevIndex >= 0) {
            const prevItem = portfolioItems[prevIndex];
            // If this item is from a different group than the previous one, use group spacing
            if (currentItem.groupIndex !== prevItem.groupIndex) {
              requiredSpacing = portfolioConfig.groupSpacing;
            }
          }

          // Check if previous item has moved enough to maintain spacing
          const canActivate =
            prevIndex < 0 ||
            (portfolioItems[prevIndex].isActive &&
              portfolioItems[prevIndex].scrollPosition > requiredSpacing);

          if (canActivate) {
            // Activate the current item
            currentItem.isActive = true;
            // Start off-screen to the right as requested
            currentItem.scrollPosition = -200; // Negative so it starts off-screen
            activePortfolioIndex++;

            // Calculate next timing based on whether the next item is in a new group
            if (activePortfolioIndex < portfolioItems.length) {
              const nextItem = portfolioItems[activePortfolioIndex];

              if (nextItem.groupIndex !== currentItem.groupIndex) {
                // Next item is in a new group, use group spacing
                nextPortfolioTime = portfolioConfig.groupSpacing / gameSpeed;
              } else {
                // Next item is in the same group, use normal spacing
                nextPortfolioTime = portfolioConfig.spacing / gameSpeed;
              }
            } else {
              // We've activated all items, set a delay before recycling
              nextPortfolioTime =
                (portfolioConfig.groupSpacing * 2) / gameSpeed;
            }
          }
        } else {
          nextPortfolioTime--;
        }

        // Debug obstacle spawning
        console.log("Game running, nextObstacleTime:", nextObstacleTime);

        // Draw obstacle
        if (obstacle.isActive && obstacle.type) {
          const currentObstacle = obstacleTypes[obstacle.type];

          context.drawImage(
            spriteImage,
            currentObstacle.spriteX,
            currentObstacle.y,
            currentObstacle.width,
            currentObstacle.height,
            canvas.width - obstacle.scrollPosition,
            ground.y - currentObstacle.height,
            currentObstacle.width,
            currentObstacle.height
          );

          obstacle.scrollPosition += gameSpeed;

          if (obstacle.scrollPosition > canvas.width + currentObstacle.width) {
            obstacle.isActive = false;
            nextObstacleTime =
              Math.floor(Math.random() * obstacleSpawnGap) + 20;
          }
        }
      }

      isOnGround = false;
      if (player.y + player.height > ground.y) {
        player.y = ground.y - player.height;
        isOnGround = true;
      }

      // Collision detection
      if (obstacle.isActive && obstacle.type) {
        const currentObstacle = obstacleTypes[obstacle.type];
        const obstacleX = canvas.width - obstacle.scrollPosition;
        const obstacleY = ground.y - currentObstacle.height;

        if (
          player.x + 20 < obstacleX + currentObstacle.width - 10 &&
          player.x + player.width - 20 > obstacleX + 10 &&
          player.y + 10 < obstacleY + currentObstacle.height - 10 &&
          player.y + player.height - 10 > obstacleY + 10
        ) {
          handleGameOver();
        }
      }

      frameInterval++;
      if (frameInterval > 10) {
        isRunningFrame = !isRunningFrame;
        frameInterval = 0;
      }

      if (isRunningFrame && isOnGround) {
        currentFrame = 1514;
      } else if (!isRunningFrame && isOnGround) {
        currentFrame = 1602;
      } else {
        currentFrame = 1338;
      }

      // Ground scrolling
      groundScrollPosition += gameSpeed;
      context.drawImage(
        spriteImage,
        2, // Exact X start
        142, // Exact Y start (corrected from 150)
        2400, // Width (2402 - 2)
        16, // Height
        0 - groundScrollPosition + tempGroundStart,
        ground.y - 8,
        2400, // Match source width
        16 // Match source height
      );

      if (
        groundScrollPosition - tempGroundStart > 2400 - canvas.width ||
        isSecondGroundActive
      ) {
        isSecondGroundActive = true;
        groundScrollPosition2 += gameSpeed;
        context.drawImage(
          spriteImage,
          2, // Exact X start
          142, // Exact Y start (corrected from 150)
          2400, // Width
          16, // Height
          0 - groundScrollPosition2 + canvas.width,
          ground.y - 8,
          2400, // Match source width
          16 // Match source height
        );

        if (
          groundScrollPosition2 > canvas.width &&
          groundScrollPosition - tempGroundStart > 1000
        ) {
          tempGroundStart = canvas.width;
          groundScrollPosition = 20;
        }

        if (groundScrollPosition2 > 2400) {
          // Updated to match new width
          groundScrollPosition2 = 0;
          isSecondGroundActive = false;
        }
      }

      // Character drawing
      if (gameSpeed !== 0) {
        context.fillStyle = "black";
        context.drawImage(
          spriteImage,
          currentFrame,
          24,
          88,
          110,
          player.x,
          player.y,
          player.width,
          player.height
        );
      } else {
        // Draw standing dinosaur when game is paused
        context.drawImage(
          spriteImage,
          1338,
          24,
          88,
          110,
          player.x,
          player.y,
          player.width,
          player.height
        );
      }

      // Score text - Chrome Dino style
      context.font = "16px 'Press Start 2P', monospace";
      context.fillStyle = "black";

      // Current score in top right
      const currentScoreText = formatScore(player.score);
      context.textAlign = "right";
      context.fillText(currentScoreText, canvas.width - 20, 30);

      // High score with "HI" prefix (only show after first game)
      if (player.highScore > 0) {
        context.textAlign = "right";
        const highScoreText = "HI " + formatScore(player.highScore);
        const highScoreWidth = context.measureText(highScoreText).width;
        context.fillText(
          highScoreText,
          canvas.width - 40 - context.measureText(currentScoreText).width,
          30
        );
      }

      // Reset text alignment for other text
      context.textAlign = "left";

      // Spawn new obstacle
      if (!obstacle.isActive) {
        if (nextObstacleTime <= 0) {
          spawnObstacle();
        } else {
          nextObstacleTime--;
        }
      }

      // Request next frame
      requestAnimationFrame(update);
    };

    // Start the game loop
    const gameLoop = requestAnimationFrame(update);

    // Cleanup function
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
      cancelAnimationFrame(gameLoop);
    };
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={860}
        height={420}
        className="w-full rounded-lg"
      />
      {gameOver && hasPlayedBeforeRef.current && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
          <div className="p-6 rounded-lg text-center text-brown-800">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="text-sm mb-4">
              Press the UP arrow key or SPACE to play again
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Add this to ensure the component only renders on the client
const DinoGameWithClientCheck = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="w-full h-[420px] bg-gray-100 rounded-lg"></div>;
  }
  return <DinoGame />;
};

export default DinoGameWithClientCheck;
