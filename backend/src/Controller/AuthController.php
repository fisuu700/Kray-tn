<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/auth', name: 'api_auth_')]
class AuthController extends AbstractController
{
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        $fullName = $data['fullName'] ?? null;
        $avatar = $data['avatar'] ?? null;

        if (!$email) {
            return $this->json(['message' => 'Email is required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$user) {
            $user = new User();
            $user->setEmail($email);
            $user->setFullName($fullName);
            $user->setAvatar($avatar);
            $user->setIsVerified(false);
            $user->setPassword('social_login_no_password');
            $em->persist($user);
            $em->flush();
        }

        // Check verification status
        if ($user->getIsVerified()) {
            return $this->json([
                'step' => 'success',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'fullName' => $user->getFullName(),
                    'avatar' => $user->getAvatar(),
                    'isVerified' => $user->getIsVerified(),
                ]
            ]);
        }

        // If not verified, check if we need phone number
        if (!$user->getPhone()) {
            return $this->json([
                'step' => 'phone',
                'userId' => $user->getId()
            ]);
        }

        // We have phone but not verified. Generate OTP and send SMS.
        return $this->sendOtpResponse($user, $em);
    }

    #[Route('/send-sms', name: 'send_sms', methods: ['POST'])]
    public function sendSms(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;
        $phone = $data['phone'] ?? null;

        if (!$userId || !$phone) {
            return $this->json(['message' => 'User ID and phone number are required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $em->getRepository(User::class)->find($userId);
        if (!$user) {
            return $this->json(['message' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Sanitize phone (basic)
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        $user->setPhone($phone);
        
        return $this->sendOtpResponse($user, $em);
    }

    private function sendOtpResponse(User $user, EntityManagerInterface $em): JsonResponse
    {
        $otp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $user->setOtpCode($otp);
        $user->setOtpExpiry(new \DateTimeImmutable('+10 minutes'));
        $em->flush();

        // TODO: In a real app, integrate Twilio or InfoBip here to send an SMS to $user->getPhone()
        error_log("Sending SMS to {$user->getPhone()}: Your Kray.tn code is {$otp}");

        return $this->json([
            'step' => 'verify',
            'userId' => $user->getId(),
            'phone' => $user->getPhone(),
            // DEV ONLY: remove in production!
            'devOtp' => $_ENV['APP_ENV'] === 'dev' ? $otp : null,
        ]);
    }

    #[Route('/verify', name: 'verify', methods: ['POST'])]
    public function verify(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;
        $code = $data['code'] ?? null;

        if (!$userId || !$code) {
            return $this->json(['message' => 'Missing userId or code'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $em->getRepository(User::class)->find($userId);
        if (!$user) {
            return $this->json(['message' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($user->getOtpCode() !== $code) {
            return $this->json(['message' => 'Invalid confirmation code. Please try again.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        if ($user->getOtpExpiry() < new \DateTimeImmutable()) {
            return $this->json(['message' => 'Code has expired. Please request a new one.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $user->setOtpCode(null);
        $user->setOtpExpiry(null);
        $user->setIsVerified(true);
        $em->flush();

        return $this->json([
            'step' => 'success',
            'user' => [
                'id'         => $user->getId(),
                'email'      => $user->getEmail(),
                'fullName'   => $user->getFullName(),
                'avatar'     => $user->getAvatar(),
                'isVerified' => $user->getIsVerified(),
                'phone'      => $user->getPhone(),
            ]
        ]);
    }
}
