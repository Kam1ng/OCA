package com.example.eldercare.service.impl;

import com.example.eldercare.dto.CaptchaDTO;
import com.example.eldercare.service.CaptchaService;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CaptchaServiceImpl implements CaptchaService {

    // 使用内存存储验证码（测试用）
    private static final Map<String, String> captchaStore = new ConcurrentHashMap<>();
    
    // 验证码有效期5分钟
    private static final int CAPTCHA_EXPIRE_MINUTES = 5;
    
    // 验证码字符集
    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    
    // 验证码长度
    private static final int CAPTCHA_LENGTH = 4;
    
    // 图片宽度
    private static final int WIDTH = 100;
    
    // 图片高度
    private static final int HEIGHT = 40;

    @Override
    public CaptchaDTO generateCaptcha() {
        String captchaCode = generateCode();
        String captchaKey = UUID.randomUUID().toString();
        
        // 存储验证码到内存
        captchaStore.put(captchaKey, captchaCode);
        
        // 生成验证码图片
        String captchaBase64 = generateCaptchaImage(captchaCode);
        
        // 启动过期清理线程
        scheduleExpire(captchaKey);
        
        return new CaptchaDTO(captchaKey, captchaBase64);
    }

    @Override
    public boolean verifyCaptcha(String captchaKey, String captchaCode) {
        if (captchaKey == null || captchaCode == null) {
            return false;
        }
        
        String storedCode = captchaStore.get(captchaKey);
        if (storedCode == null) {
            return false;
        }
        
        boolean isValid = storedCode.equalsIgnoreCase(captchaCode);
        
        // 验证后立即删除，防止重复使用
        if (isValid) {
            captchaStore.remove(captchaKey);
        }
        
        return isValid;
    }

    @Override
    public void removeCaptcha(String captchaKey) {
        captchaStore.remove(captchaKey);
    }

    /**
     * 生成随机验证码
     */
    private String generateCode() {
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < CAPTCHA_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }

    /**
     * 生成验证码图片并转为Base64
     */
    private String generateCaptchaImage(String code) {
        BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        
        // 设置背景色
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, WIDTH, HEIGHT);
        
        // 设置边框
        g.setColor(Color.GRAY);
        g.drawRect(0, 0, WIDTH - 1, HEIGHT - 1);
        
        Random random = new Random();
        
        // 绘制干扰线
        for (int i = 0; i < 10; i++) {
            int x1 = random.nextInt(WIDTH);
            int y1 = random.nextInt(HEIGHT);
            int x2 = random.nextInt(WIDTH);
            int y2 = random.nextInt(HEIGHT);
            g.setColor(new Color(random.nextInt(256), random.nextInt(256), random.nextInt(256)));
            g.drawLine(x1, y1, x2, y2);
        }
        
        // 绘制干扰点
        for (int i = 0; i < 50; i++) {
            int x = random.nextInt(WIDTH);
            int y = random.nextInt(HEIGHT);
            g.setColor(new Color(random.nextInt(256), random.nextInt(256), random.nextInt(256)));
            g.fillOval(x, y, 1, 1);
        }
        
        // 设置字体
        Font font = new Font("Arial", Font.BOLD, 28);
        g.setFont(font);
        
        // 绘制验证码字符
        for (int i = 0; i < code.length(); i++) {
            char c = code.charAt(i);
            g.setColor(new Color(random.nextInt(100) + 50, random.nextInt(100) + 50, random.nextInt(100) + 50));
            // 添加随机偏移和旋转
            int x = 15 + i * 20;
            int y = 28 + random.nextInt(6) - 3;
            double angle = (random.nextInt(20) - 10) * Math.PI / 180;
            g.rotate(angle, x, y);
            g.drawString(String.valueOf(c), x, y);
            g.rotate(-angle, x, y);
        }
        
        g.dispose();
        
        // 转为Base64
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(image, "PNG", baos);
            byte[] imageBytes = baos.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(imageBytes);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 定时清理过期验证码
     */
    private void scheduleExpire(String captchaKey) {
        new Thread(() -> {
            try {
                Thread.sleep(CAPTCHA_EXPIRE_MINUTES * 60 * 1000);
                captchaStore.remove(captchaKey);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
}