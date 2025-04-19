'use client'

import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaLevelUpAlt, FaPlusCircle } from 'react-icons/fa';
import { FaUpwork } from 'react-icons/fa6';

// Interfaces remain the same
interface FloatingPoint {
    id: number;
    value: string;
    x: number;
}

interface Enemy {
    id: number;
    health: number;
    maxHealth: number;
    positionX: number;
    positionY: number;
}

interface Weapon {
    name: string;
    damage: number;
    cooldown: number;
    lastFired: number;
}

interface Projectile {
    id: number;
    positionX: number;
    positionY: number;
    directionX: number;
    directionY: number;
    damage: number;
}

const GamePage = () => {
    // Game Selection State
    const [selectedGame, setSelectedGame] = useState<'EEK' | 'Survival' | null>(null);

    // Game1 (EEK) States (unchanged)
    const [skor, setSkor] = useState<number>(0);
    const [poinPerKlik, setPoinPerKlik] = useState<number>(1);
    const [level, setLevel] = useState<number>(1);
    const [levelPoin, setLevelPoin] = useState<number>(100);
    const [autoKlik, setAutoKlik] = useState<number>(1);
    const [upgradeCostKlik, setUpgradeCostKlik] = useState<number>(10);
    const [upgradeCostAutoKlik, setUpgradeCostAutoKlik] = useState<number>(20);
    const [doublePoinCost, setDoublePoinCost] = useState<number>(50);
    const [multiplyByFiveCost, setMultiplyByFiveCost] = useState<number>(100);
    const [strength, setStrength] = useState<number>(0);
    const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);

    // Survival Game States
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
    const [playerHealth, setPlayerHealth] = useState<number>(100);
    const [xp, setXp] = useState<number>(0);
    const [xpToLevel, setXpToLevel] = useState<number>(50);
    const [survivalLevel, setSurvivalLevel] = useState<number>(1);
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [weapons, setWeapons] = useState<Weapon[]>([
        { name: 'Toilet Paper Roll', damage: 10, cooldown: 1000, lastFired: 0 },
    ]);
    const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const [lastProjectileTime, setLastProjectileTime] = useState<number>(0);
    const projectileCooldown = 500;
    const projectileDamage = 20;
    const gameAreaRef = useRef<HTMLDivElement>(null);

    // Game1 (EEK) Logic (unchanged)
    useEffect(() => {
        if (selectedGame === 'EEK') {
            const interval = setInterval(() => {
                setSkor((prev) => prev + autoKlik);
            }, 1000);
            return () => clearInterval(interval); 
        }
    }, [autoKlik, selectedGame]);

    useEffect(() => {
        if (selectedGame === 'EEK' && skor >= levelPoin) {
            setLevel((prev) => prev + 1);
            setPoinPerKlik((prev) => prev + 1);
            setLevelPoin((prev) => prev * 2);
            notifyLevelUp();
        }
    }, [skor, levelPoin, selectedGame]);

    useEffect(() => {
        if (selectedGame === 'EEK') {
            setStrength((skor / levelPoin) * 100);
        }
    }, [skor, levelPoin, selectedGame]);

    // WASD Movement Logic (unchanged)
    useEffect(() => {
        if (selectedGame === 'Survival') {
            const handleKeyDown = (e: KeyboardEvent) => {
                setKeysPressed(prev => new Set(prev).add(e.key.toLowerCase()));
            };

            const handleKeyUp = (e: KeyboardEvent) => {
                setKeysPressed(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(e.key.toLowerCase());
                    return newSet;
                });
            };

            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('keyup', handleKeyUp);
            };
        }
    }, [selectedGame]);

    //logika untuk menggerakkan pemain
    useEffect(() => {
        if (selectedGame === 'Survival' && isPlaying) {
            const gameLoop = setInterval(() => {
                const speed = 1;
                let newX = playerPos.x;
                let newY = playerPos.y;

                if (keysPressed.has('w')) newY -= speed;
                if (keysPressed.has('s')) newY += speed;
                if (keysPressed.has('a')) newX -= speed;
                if (keysPressed.has('d')) newX += speed;

                setPlayerPos({
                    x: Math.max(0, Math.min(100, newX)),
                    y: Math.max(0, Math.min(100, newY)),
                });
                
                const currentTime = Date.now();

                // Automatic projectile attack toward nearest enemy
                if (enemies.length > 0 && currentTime - lastProjectileTime >= projectileCooldown) {
                    const nearestEnemy = enemies.reduce((closest, enemy) => {
                        const distToClosest = Math.sqrt(
                            Math.pow(closest.positionX - playerPos.x, 2) +
                            Math.pow(closest.positionY - playerPos.y, 2)
                        );
                        const distToEnemy = Math.sqrt(
                            Math.pow(enemy.positionX - playerPos.x, 2) +
                            Math.pow(enemy.positionY - playerPos.y, 2)
                        );
                        return distToEnemy < distToClosest ? enemy : closest;
                    });

                    const dx = nearestEnemy.positionX - playerPos.x;
                    const dy = nearestEnemy.positionY - playerPos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const directionX = distance > 0 ? dx / distance : 0;
                    const directionY = distance > 0 ? dy / distance : 0;

                    setProjectiles(prev => [
                        ...prev,
                        {
                            id: currentTime,
                            positionX: playerPos.x,
                            positionY: playerPos.y,
                            directionX,
                            directionY,
                            damage: projectileDamage,
                        },
                    ]);
                    setLastProjectileTime(currentTime);
                }

                // Update projectiles and handle collisions
                const hitProjectiles = new Set<number>();
                let updatedEnemies = [...enemies];

                let updatedProjectiles = projectiles.map(proj => ({
                    ...proj,
                    positionX: proj.positionX + proj.directionX * 1,
                    positionY: proj.positionY + proj.directionY * 1,
                }));

                updatedProjectiles.forEach(proj => {
                    updatedEnemies = updatedEnemies.map(enemy => {
                        const distance = Math.sqrt(
                            Math.pow(enemy.positionX - proj.positionX, 2) +
                            Math.pow(enemy.positionY - proj.positionY, 2)
                        );
                        if (distance < 5 && !hitProjectiles.has(proj.id)) {
                            hitProjectiles.add(proj.id);
                            const newHealth = enemy.health - proj.damage;
                            if (newHealth <= 0) {
                                setXp(prev => prev + 10);
                            }
                            return { ...enemy, health: Math.max(0, newHealth) };
                        }
                        return enemy;
                    });
                });

                updatedEnemies = updatedEnemies.filter(enemy => enemy.health > 0);
                updatedProjectiles = updatedProjectiles.filter(proj =>
                    !hitProjectiles.has(proj.id) &&
                    proj.positionX >= 0 && proj.positionX <= 100 &&
                    proj.positionY >= 0 && proj.positionY <= 100
                );

                setEnemies(updatedEnemies);
                setProjectiles(updatedProjectiles);

                // Spawn enemies
                if (Math.random() > 0.95) {
                    const angle = Math.random() * 2 * Math.PI;
                    const distance = 60;
                    const baseHealth = 30 + survivalLevel * 10;
                    setEnemies(prev => [...prev, {
                        id: Date.now(),
                        health: baseHealth,
                        maxHealth: baseHealth,
                        positionX: playerPos.x + Math.cos(angle) * distance,
                        positionY: playerPos.y + Math.sin(angle) * distance,
                    }]);
                }

                // Move enemies and handle attacks
                setEnemies(prev => {
                    return prev.map(enemy => {
                        const dx = playerPos.x - enemy.positionX;
                        const dy = playerPos.y - enemy.positionY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const speed = 0.5 + survivalLevel * 0.1;
                        const moveX = distance > 0 ? (dx / distance) * speed : 0;
                        const moveY = distance > 0 ? (dy / distance) * speed : 0;

                        if (distance < 5) {
                            setPlayerHealth(prev => Math.max(0, prev - 1));
                        }

                        return {
                            ...enemy,
                            positionX: enemy.positionX + moveX,
                            positionY: enemy.positionY + moveY,
                        };
                    }).filter(enemy => enemy.health > 0);
                });

                // Auto-attack with weapons (unchanged)
                setWeapons(prevWeapons => {
                    const updatedWeapons = prevWeapons.map(weapon => ({ ...weapon }));
                    setEnemies(prevEnemies => {
                        const updatedEnemies = prevEnemies.map(enemy => ({ ...enemy }));
                        updatedWeapons.forEach(weapon => {
                            if (currentTime - weapon.lastFired >= weapon.cooldown) {
                                updatedEnemies.forEach(enemy => {
                                    const distance = Math.sqrt(
                                        Math.pow(enemy.positionX - playerPos.x, 2) +
                                        Math.pow(enemy.positionY - playerPos.y, 2)
                                    );
                                    if (distance < 20) {
                                        enemy.health -= weapon.damage;
                                        if (enemy.health <= 0) {
                                            setXp(prev => prev + 10);
                                        }
                                    }
                                });
                                weapon.lastFired = currentTime;
                            }
                        });
                        return updatedEnemies.filter(enemy => enemy.health > 0);
                    });
                    return updatedWeapons;
                });

                // Level up
                if (xp >= xpToLevel) {
                    setSurvivalLevel(prev => prev + 1);
                    setXp(prev => prev - xpToLevel);
                    setXpToLevel(prev => prev * 1.5);
                    toast.success(`🎉 Survival Level ${survivalLevel + 1}!`, { theme: 'dark', position: 'top-right' });
                    if (survivalLevel % 3 === 0) {
                        setWeapons(prev => [...prev, {
                            name: `Poop Blaster ${survivalLevel / 3 + 1}`,
                            damage: 15 + survivalLevel * 2,
                            cooldown: 800 - survivalLevel * 50,
                            lastFired: 0,
                        }]);
                    }
                }

                // Game over
                if (playerHealth <= 0) {
                    toast.error('💀 Game Over!', { theme: 'dark', position: 'top-right' });
                    setSkor(prev => prev + xp);
                    resetGame();
                }
            }, 50);

            return () => clearInterval(gameLoop);
        }
    }, [selectedGame, isPlaying, playerPos, xp, survivalLevel, playerHealth, weapons, keysPressed, enemies]);

    const notifyUpgrade = (type: string) => {
        toast.success(`🎉 Berhasil Upgrade ${type}!`, {
            theme: 'dark',
            icon: <FaCheck className='text-green-400' />,
            position: 'top-right',
        });
    };

    const notifyLevelUp = () => {
        toast.success(`🎉 Berhasil naik Level ${level + 1}!`, {
            theme: 'dark',
            icon: <FaLevelUpAlt className='text-green-400' />,
            position: 'top-right',
        });
    };

    const handleClick = () => {
        setSkor((prev) => prev + poinPerKlik);
        const id = Date.now();
        setFloatingPoints((prev) => [
            ...prev,
            { id, value: `+${poinPerKlik}`, x: Math.random() * 100 - 50 },
        ]);
        setTimeout(() => {
            setFloatingPoints((prev) => prev.filter((point) => point.id !== id));
        }, 1200);
    };

    const upgradePoinPerKlik = () => {
        if (skor >= upgradeCostKlik) {
            setSkor((prev) => prev - upgradeCostKlik);
            setPoinPerKlik((prev) => prev + 1);
            setUpgradeCostKlik((prev) => Math.floor(prev * 1.5));
            notifyUpgrade("Poin per Klik");
        } else {
            toast.error("❌ Skor Tidak Cukup untuk Upgrade!", { theme: 'dark', position: 'top-right' });
        }
    };

    const upgradeAutoKlik = () => {
        if (skor >= upgradeCostAutoKlik) {
            setSkor((prev) => prev - upgradeCostAutoKlik);
            setAutoKlik((prev) => prev * 2);
            setUpgradeCostAutoKlik((prev) => Math.floor(prev * 3));
            notifyUpgrade("Auto Klik");
        } else {
            toast.error('❌ Skor Tidak Cukup untuk Upgrade!', { theme: 'dark', position: 'top-right' });
        }
    };

    const upgradeDoublePoints = () => {
        if (skor >= doublePoinCost) {
            setSkor((prev) => prev - doublePoinCost);
            setPoinPerKlik((prev) => prev * 4);
            setDoublePoinCost((prev) => prev * 10);
            notifyUpgrade("Double Points");
        } else {
            toast.error("❌ Skor Tidak Cukup untuk Upgrade!", { theme: 'dark', position: 'top-right' });
        }
    };

    const upgradeMultiplyByFive = () => {
        if (skor >= multiplyByFiveCost) {
            setSkor((prev) => prev - multiplyByFiveCost);
            setPoinPerKlik((prev) => prev * 5);
            setMultiplyByFiveCost((prev) => prev * 100);
            notifyUpgrade("Multiply by 5");
        } else {
            toast.error("❌ Skor Tidak Cukup untuk Upgrade!", { theme: 'dark', position: 'top-right' });
        }
    };

    const startGame = () => {
        if (!isPlaying) {
            setIsPlaying(true);
            setPlayerHealth(100);
            setXp(0);
            setSurvivalLevel(1);
            setXpToLevel(50);
            setEnemies([]);
            setProjectiles([]);
            setWeapons([{ name: 'Toilet Paper Roll', damage: 10, cooldown: 1000, lastFired: 0 }]);
            toast.info('🧻 Survival Started!', { theme: 'dark', position: 'top-right' });
        }
    };

    const resetGame = () => {
        setIsPlaying(false);
        setPlayerPos({ x: 50, y: 50 });
        setPlayerHealth(100);
        setXp(0);
        setSurvivalLevel(1);
        setXpToLevel(50);
        setEnemies([]);
        setProjectiles([]);
        setKeysPressed(new Set());
    };

    // Game Selection Screen (unchanged)
    if (!selectedGame) {
        return (
            <div className='min-h-screen w-full p-4 md:p-8 m-4 md:m-12 flex flex-col items-center justify-center gap-8 bg-gray-900'>
                <h1 className='text-4xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'>
                    Choose Your Game
                </h1>
                <div className='flex flex-col md:flex-row gap-4'>
                    <button
                        className='p-4 rounded-xl bg-gradient-to-b from-orange-700 to-amber-500 text-white font-semibold text-lg border-2 border-yellow-400 hover:scale-105 transition-all shadow-lg'
                        onClick={() => setSelectedGame('EEK')}
                    >
                        Game EEK 💩
                    </button>
                    <button
                        className='p-4 rounded-xl bg-gradient-to-b from-green-700 to-green-500 text-white font-semibold text-lg border-2 border-green-400 hover:scale-105 transition-all shadow-lg'
                        onClick={() => setSelectedGame('Survival')}
                    >
                        Poop Survivors 🧻
                    </button>
                </div>
                <p className='text-white italic'>Pick one to start playing and reduce lag!</p>
            </div>
        );
    }

    return (
        <div className='min-h-screen w-full p-4 md:p-8 m-4 md:m-12 flex flex-col gap-8 bg-gray-900'>
            {selectedGame === 'EEK' && (
                <div className='max-w-2xl mx-auto text-center border-2 bg-gradient-to-b from-orange-700 to-amber-500 rounded-3xl p-4 md:p-8 shadow-2xl bg-amber-800/20 backdrop-blur-sm'>
                    <div className='mb-4 md:mb-8 border-b-2 border-amber-300 pb-4 md:pb-6'>
                        <h1 className='text-3xl sm:text-4xl font-bold mb-2 md:mb-4 text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'>
                            Game EEK 💩
                        </h1>
                        <p className='text-sm md:text-lg text-amber-100 italic'>
                            Sentuh untuk Eek 💩 sebanyak mungkin!
                        </p>
                    </div>

                    <div className='bg-amber-800/30 p-4 md:p-6 rounded-xl mb-4 md:mb-8 border-2 border-amber-400 shadow-inner'>
                        <p className='text-xl md:text-2xl font-bold mb-2 md:mb-4 text-amber-100'>
                            Skor: <span className='text-yellow-400 font-mono'>{skor}</span>
                            Level: <span className='text-yellow-400 font-mono'>{level}</span>
                        </p>
                        <div className='w-full bg-gray-800 rounded-full h-3 md:h-4 mb-2 md:mb-4 border border-amber-400'>
                            <div
                                className='bg-yellow-400 h-3 md:h-4 rounded-full transition-all duration-500 ease-out'
                                style={{ width: `${Math.min(strength, 100)}%`, boxShadow: '0 2px 8px rgba(255, 196, 0, 0.5)' }}
                            />
                        </div>
                    </div>
                    <div className='relative cursor-pointer mb-6 md:mb-8 group' onClick={handleClick}>
                        <div className='text-6xl sm:text-8xl transition-transform duration-200 hover:scale-110 active:scale-95 animate-bounce border-4 border-yellow-300 rounded-full p-2 md:p-4 shadow-[0_0_30px_rgba(255,196,0,0.3)] hover:shadow-[0_0_40px_rgba(255,196,0,0.5)]'>
                            💩
                        </div>
                        {floatingPoints.map((point) => (
                            <span
                                key={point.id}
                                className='absolute text-yellow-400 font-bold animate-float text-lg md:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'
                                style={{ left: `${50 + point.x}%` }}
                            >
                                {point.value}
                            </span>
                        ))}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4'>
                        {[
                            { onClick: upgradePoinPerKlik, text: `Upgrade Klik (💩 ${upgradeCostKlik})`, icon: <FaPlusCircle /> },
                            { onClick: upgradeAutoKlik, text: `Auto Klik (💩 ${upgradeCostAutoKlik})`, icon: <FaUpwork /> },
                            { onClick: upgradeDoublePoints, text: `Double Poin (💩 ${doublePoinCost})`, disabled: level < 2 },
                            { onClick: upgradeMultiplyByFive, text: `x5 Poin (💩 ${multiplyByFiveCost})`, disabled: level < 5 },
                        ].map((button, index) => (
                            <button
                                key={index}
                                className={`p-2 md:p-4 rounded-xl flex items-center justify-center gap-1 md:gap-3 transition-all border-2 border-yellow-400 bg-amber-700/80 hover:bg-amber-600 hover:border-yellow-300 hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:border-amber-600 disabled:shadow-none ${button.disabled ? 'grayscale' : ''}`}
                                onClick={button.onClick}
                                disabled={button.disabled}
                            >
                                <span className='text-yellow-400 text-lg md:text-xl'>{button.icon || <FaPlusCircle />}</span>
                                <span className='text-sm md:text-base text-amber-50 font-semibold'>{button.text}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        className='mt-4 p-2 md:p-4 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-all'
                        onClick={() => setSelectedGame(null)}
                    >
                        Back to Game Selection
                    </button>
                </div>
            )}

            {selectedGame === 'Survival' && (
                <div className='max-w-2xl mx-auto text-center border-2 bg-gradient-to-b from-green-700 to-green-500 rounded-3xl p-4 md:p-8 shadow-2xl bg-green-800/20 backdrop-blur-sm'>
                    <div className='mb-4 md:mb-8 border-b-2 border-green-300 pb-4 md:pb-6'>
                        <h1 className='text-3xl sm:text-4xl font-bold mb-2 md:mb-4 text-green-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'>
                            Poop Survivors 🧻
                        </h1>
                        <p className='text-sm md:text-lg text-green-100 italic'>
                            Survive waves of poop with WASD and auto-shooting at the nearest enemy!
                        </p>
                    </div>

                    <div className='bg-green-800/30 p-4 md:p-6 rounded-xl mb-4 md:mb-8 border-2 border-green-400 shadow-inner'>
                        <div className='flex justify-between mb-4'>
                            <p className='text-lg text-green-100'>
                                Health: <span className='text-green-400 font-mono'>{playerHealth}</span>
                            </p>
                            <p className='text-lg text-green-100'>
                                Level: <span className='text-green-400 font-mono'>{survivalLevel}</span> (XP: {xp}/{xpToLevel})
                            </p>
                        </div>
                        <div
                            className='relative w-full h-64 bg-gray-800 rounded-xl border border-green-400 overflow-hidden'
                            tabIndex={0}
                            ref={gameAreaRef}
                        >
                            {/* Player */}
                            <div
                                className='absolute w-8 h-8 text-2xl transition-all duration-50'
                                style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%`, transform: 'translate(-50%, -50%)' }}
                            >
                                🧻
                            </div>
                            {/* Enemies with Health */}
                            {enemies.map(enemy => (
                                <div
                                    key={enemy.id}
                                    className='absolute w-6 h-6 text-2xl transition-all duration-50'
                                    style={{ left: `${enemy.positionX}%`, top: `${enemy.positionY}%`, transform: 'translate(-50%, -50%)' }}
                                >
                                    💩
                                    <div className='absolute top-[-1.5rem] left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-500 rounded'>
                                        <div
                                            className='h-full bg-red-500 rounded'
                                            style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                                        />
                                    </div>
                                    <span
                                        className='absolute top-[-1.5rem] left-1/2 transform -translate-x-1/2 text-xs text-red-400 font-bold'
                                    >
                                        {enemy.health}/{enemy.maxHealth}
                                    </span>
                                </div>
                            ))}
                            {/* Projectiles */}
                            {projectiles.map(proj => (
                                <div
                                    key={proj.id}
                                    className='absolute w-4 h-4 text-xl bg-blue-500 rounded-full transition-all duration-50'
                                    style={{ left: `${proj.positionX}%`, top: `${proj.positionY}%`, transform: 'translate(-50%, -50%)' }}
                                >
                                    💦
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-2 md:gap-4'>
                        <button
                            className={`p-2 md:p-4 rounded-xl flex items-center justify-center gap-1 md:gap-3 transition-all border-2 border-green-400 bg-green-700/80 hover:bg-green-600 hover:border-green-300 hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={startGame}
                            disabled={isPlaying}
                        >
                            <span className='text-green-400 text-lg md:text-xl'>🧻</span>
                            <span className='text-sm md:text-base text-green-50 font-semibold'>Start Survival</span>
                        </button>
                    </div>
                    {isPlaying && (
                        <div className='mt-4 text-green-100'>
                            <p>Weapons:</p>
                            <ul className='list-disc list-inside'>
                                {weapons.map((weapon, index) => (
                                    <li key={index}>
                                        {weapon.name} (Dmg: {weapon.damage}, CD: {weapon.cooldown}ms)
                                    </li>
                                ))}
                                <li>Water Projectile (Dmg: {projectileDamage}, CD: {projectileCooldown}ms)</li>
                            </ul>
                            <p className='mt-2'>Controls: W (Up), A (Left), S (Down), D (Right) - Auto-shoots nearest enemy!</p>
                        </div>
                    )}

                    <button
                        className='mt-4 p-2 md:p-4 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-all'
                        onClick={() => setSelectedGame(null)}
                    >
                        Back to Game Selection
                    </button>
                </div>
            )}
        </div>
    );
}

export default GamePage;